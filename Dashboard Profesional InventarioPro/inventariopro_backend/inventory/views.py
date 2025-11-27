from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import F
from django.utils.dateparse import parse_date
from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from services.currency import get_usd_to_mxn_rate
from services.reports import get_dashboard_metrics, get_range_report

from .models import Movement, Product
from .serializers import MovementSerializer, ProductSerializer


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


class DashboardView(APIView):
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

        metrics = get_dashboard_metrics(start_date, end_date)
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
        product_param = request.query_params.get('product')

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

        product_id = None
        if product_param:
            try:
                product_id = int(product_param)
            except (TypeError, ValueError):
                return Response({'detail': 'Invalid product id'}, status=status.HTTP_400_BAD_REQUEST)

        report = get_range_report(start_date, end_date, product_id=product_id)
        return Response(normalize_payload(report))


class UsdRateView(APIView):
    def get(self, request, *args, **kwargs):
        rate = get_usd_to_mxn_rate()
        return Response({'rate': float(rate)})
