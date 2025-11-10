from __future__ import annotations

from decimal import Decimal

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from inventory.models import Movement, Product


class MovementTests(APITestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name='Producto Test',
            code='TEST1',
            stock=Decimal('0'),
            low_threshold=Decimal('5'),
            avg_cost=Decimal('10.00'),
            suggested_price=Decimal('15.00'),
        )

    def test_stock_updates_with_in_and_out(self):
        Movement.objects.create(
            product=self.product,
            movement_type=Movement.MovementType.IN,
            quantity=Decimal('10'),
            unit_price=Decimal('12.50'),
            date=timezone.now().date(),
        )
        Movement.objects.create(
            product=self.product,
            movement_type=Movement.MovementType.OUT,
            quantity=Decimal('4'),
            unit_price=Decimal('20.00'),
            date=timezone.now().date(),
        )
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, Decimal('6'))

    def test_updating_movement_adjusts_stock(self):
        movement = Movement.objects.create(
            product=self.product,
            movement_type=Movement.MovementType.IN,
            quantity=Decimal('10'),
            unit_price=Decimal('12.50'),
            date=timezone.now().date(),
        )
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, Decimal('10'))

        movement.quantity = Decimal('15')
        movement.save()
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, Decimal('15'))

    def test_create_in_movement_endpoint(self):
        url = reverse('movement-list')
        payload = {
            'product': self.product.id,
            'movement_type': Movement.MovementType.IN,
            'quantity': '8',
            'unit_price': '11.00',
            'date': timezone.now().date().isoformat(),
            'note': 'Entrada por compra',
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, Decimal('8'))

    def test_create_out_movement_endpoint(self):
        Movement.objects.create(
            product=self.product,
            movement_type=Movement.MovementType.IN,
            quantity=Decimal('12'),
            unit_price=Decimal('10'),
            date=timezone.now().date(),
        )
        url = reverse('movement-list')
        payload = {
            'product': self.product.id,
            'movement_type': Movement.MovementType.OUT,
            'quantity': '5',
            'unit_price': '14.00',
            'date': timezone.now().date().isoformat(),
            'note': 'Salida por venta',
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, Decimal('7'))
