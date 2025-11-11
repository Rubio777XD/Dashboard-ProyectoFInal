from __future__ import annotations

from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from inventory.models import Movement, Product
from services import reports


class ReportCalculationsTests(TestCase):
    def setUp(self):
        rate_patcher = patch('services.reports.get_mxn_to_usd_rate', return_value=Decimal('0.05'))
        self.addCleanup(rate_patcher.stop)
        rate_patcher.start()

        self.product = Product.objects.create(
            name='Producto Reporte',
            code='REP1',
            category=Product.ProductCategory.GAMING_PCS,
            stock=Decimal('0'),
            low_threshold=Decimal('5'),
            avg_cost=Decimal('10'),
            suggested_price=Decimal('15'),
        )
        base_date = timezone.now().date() - timedelta(days=5)
        Movement.objects.create(
            product=self.product,
            movement_type=Movement.MovementType.IN,
            quantity=Decimal('10'),
            unit_price=Decimal('10'),
            date=base_date,
        )
        Movement.objects.create(
            product=self.product,
            movement_type=Movement.MovementType.OUT,
            quantity=Decimal('4'),
            unit_price=Decimal('20'),
            date=base_date + timedelta(days=1),
        )
        Movement.objects.create(
            product=self.product,
            movement_type=Movement.MovementType.OUT,
            quantity=Decimal('3'),
            unit_price=Decimal('25'),
            date=base_date + timedelta(days=2),
        )

    def test_income_total_by_range(self):
        start = timezone.now().date() - timedelta(days=7)
        end = timezone.now().date()
        totals = reports.get_range_report(start, end)
        self.assertEqual(totals['ingresos_mxn'], Decimal('155.00'))

    def test_expense_total_by_range(self):
        start = timezone.now().date() - timedelta(days=7)
        end = timezone.now().date()
        totals = reports.get_range_report(start, end)
        self.assertEqual(totals['egresos_mxn'], Decimal('100.00'))

    def test_balance_calculation(self):
        start = timezone.now().date() - timedelta(days=7)
        end = timezone.now().date()
        totals = reports.get_range_report(start, end)
        self.assertEqual(totals['balance_mxn'], Decimal('55.00'))

    def test_low_stock_detection(self):
        self.product.refresh_from_db()
        self.product.low_threshold = Decimal('20')
        self.product.save()
        dashboard = reports.get_dashboard_metrics()
        self.assertEqual(dashboard['low_stock_count'], 1)


class ReportEndpointsTests(TestCase):
    def setUp(self):
        rate_patcher = patch('services.reports.get_mxn_to_usd_rate', return_value=Decimal('0.05'))
        self.addCleanup(rate_patcher.stop)
        rate_patcher.start()

        self.client = APIClient()
        self.product = Product.objects.create(
            name='Producto API',
            code='API1',
            category=Product.ProductCategory.PERIPHERALS,
            stock=Decimal('0'),
            low_threshold=Decimal('5'),
            avg_cost=Decimal('10'),
            suggested_price=Decimal('15'),
        )
        today = timezone.now().date()
        Movement.objects.create(
            product=self.product,
            movement_type=Movement.MovementType.IN,
            quantity=Decimal('10'),
            unit_price=Decimal('12'),
            date=today,
        )
        Movement.objects.create(
            product=self.product,
            movement_type=Movement.MovementType.OUT,
            quantity=Decimal('6'),
            unit_price=Decimal('18'),
            date=today,
        )

    def test_dashboard_endpoint(self):
        url = reverse('dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        expected_keys = {
            'ingresos_mxn',
            'egresos_mxn',
            'balance_mxn',
            'low_stock_count',
            'product_count',
            'total_stock_units',
            'inventory_value_mxn',
            'usd_rate',
            'ingresos_usd',
            'egresos_usd',
            'balance_usd',
        }
        self.assertTrue(expected_keys.issubset(payload.keys()))

    def test_reports_endpoint_returns_series(self):
        url = reverse('reports')
        start = (timezone.now().date() - timedelta(days=1)).isoformat()
        end = timezone.now().date().isoformat()
        response = self.client.get(url, {'from': start, 'to': end})
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn('series', payload)
        self.assertGreaterEqual(len(payload['series']), 1)
