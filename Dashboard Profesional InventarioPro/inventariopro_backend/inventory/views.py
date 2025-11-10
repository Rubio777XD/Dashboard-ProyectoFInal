from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal

from django.utils.dateparse import parse_date
from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

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


class MovementViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Movement.objects.select_related('product').order_by('-date', '-id')
    serializer_class = MovementSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        limit = self.request.query_params.get('limit') or self.request.query_params.get('page_size')
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
