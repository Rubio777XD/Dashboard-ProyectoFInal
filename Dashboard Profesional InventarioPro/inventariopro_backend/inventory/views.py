from __future__ import annotations

from datetime import datetime, timedelta
from collections import defaultdict
from decimal import Decimal

from django.db.models import F
from django.utils.dateparse import parse_date
from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from services.reports import get_dashboard_metrics, get_range_report

from .models import Movement, Product, Service
from .serializers import MovementSerializer, ProductSerializer, ServiceSerializer


def normalize_payload(data):
    if isinstance(data, Decimal):
        return float(data)
    if isinstance(data, dict):
        return {key: normalize_payload(value) for key, value in data.items()}
    if isinstance(data, list):
        return [normalize_payload(item) for item in data]
    return data


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('name')
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        name = self.request.query_params.get('name')
        category = self.request.query_params.get('category')
        low_stock = self.request.query_params.get('low_stock')

        if name:
            queryset = queryset.filter(name__icontains=name)
        if category:
            queryset = queryset.filter(category=category)
        if low_stock is not None:
            queryset = queryset.filter(stock__lte=F('low_threshold'))
        return queryset


class MovementViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Movement.objects.select_related('product').order_by('-date', '-id')
    serializer_class = MovementSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product')
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        if start:
            queryset = queryset.filter(date__gte=start)
        if end:
            queryset = queryset.filter(date__lte=end)
        limit = self.request.query_params.get('limit') or self.request.query_params.get('page_size')
        if limit:
            try:
                return queryset[: int(limit)]
            except (TypeError, ValueError):
                return queryset
        return queryset


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by('name')
    serializer_class = ServiceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        name = self.request.query_params.get('name')
        category = self.request.query_params.get('category')
        status = self.request.query_params.get('status')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        limit = self.request.query_params.get('limit') or self.request.query_params.get('page_size')

        if name:
            queryset = queryset.filter(name__icontains=name)
        if category:
            queryset = queryset.filter(category=category)
        if status:
            queryset = queryset.filter(status=status)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if limit:
            try:
                return queryset[: int(limit)]
            except (TypeError, ValueError):
                return queryset
        return queryset


class DashboardView(APIView):
    def get(self, request, *args, **kwargs):
        metrics = get_dashboard_metrics()
        return Response(normalize_payload(metrics))


class InventorySummaryView(APIView):
    def get(self, request, *args, **kwargs):
        queryset = Product.objects.all().order_by('name')
        serializer = ProductSerializer(queryset, many=True)

        products_list = list(queryset)
        total_stock = Decimal('0')
        inventory_value = Decimal('0')
        category_totals = defaultdict(
            lambda: {
                'category': '',
                'products': 0,
                'stock': Decimal('0'),
                'inventory_value_mxn': Decimal('0'),
            }
        )

        for product in products_list:
            total_stock += product.stock
            inventory_value += product.stock * product.avg_cost
            entry = category_totals[product.category]
            entry['category'] = product.category
            entry['products'] += 1
            entry['stock'] += product.stock
            entry['inventory_value_mxn'] += product.stock * product.avg_cost

        response = {
            'total_products': len(products_list),
            'total_stock_units': total_stock,
            'inventory_value_mxn': inventory_value,
            'categories': [category_totals[key] for key in sorted(category_totals.keys())],
            'products': serializer.data,
        }
        return Response(normalize_payload(response))


class ReportsView(APIView):
    def get(self, request, *args, **kwargs):
        start_param = request.query_params.get('from')
        end_param = request.query_params.get('to')

        if start_param and end_param:
            start_date = parse_date(start_param)
            end_date = parse_date(end_param)
            if not start_date or not end_date:
                return Response({'detail': 'Invalid date range'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            end_date = datetime.today().date()
            start_date = end_date - timedelta(days=30)

        if start_date > end_date:
            return Response({'detail': 'Invalid date range'}, status=status.HTTP_400_BAD_REQUEST)

        report = get_range_report(start_date, end_date)
        return Response(normalize_payload(report))
