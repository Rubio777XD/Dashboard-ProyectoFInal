from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from inventory.models import Product


class ProductAPITests(APITestCase):
    def setUp(self):
        catalog = [
            {
                'name': 'PlayStation 5 Edición Digital',
                'code': 'TST-PS5',
                'category': Product.ProductCategory.CONSOLES,
                'avg_cost': Decimal('11800.00'),
                'suggested_price': Decimal('13999.00'),
            },
            {
                'name': 'PC Gamer Ryzen 7 RTX 4070',
                'code': 'TST-R74070',
                'category': Product.ProductCategory.GAMING_PCS,
                'avg_cost': Decimal('26500.00'),
                'suggested_price': Decimal('31999.00'),
            },
            {
                'name': 'HyperX Cloud III Wireless',
                'code': 'TST-HXCL3',
                'category': Product.ProductCategory.PERIPHERALS,
                'avg_cost': Decimal('2899.00'),
                'suggested_price': Decimal('3699.00'),
            },
            {
                'name': 'NVIDIA GeForce RTX 4070 Ti SUPER',
                'code': 'TST-4070T',
                'category': Product.ProductCategory.COMPONENTS,
                'avg_cost': Decimal('18999.00'),
                'suggested_price': Decimal('23499.00'),
            },
            {
                'name': 'Silla Gamer Secretlab Titan Evo',
                'code': 'TST-TITAN',
                'category': Product.ProductCategory.ACCESSORIES,
                'avg_cost': Decimal('8999.00'),
                'suggested_price': Decimal('10999.00'),
            },
        ]

        for item in catalog:
            Product.objects.create(
                name=item['name'],
                code=item['code'],
                category=item['category'],
                stock=Decimal('10'),
                low_threshold=Decimal('4'),
                avg_cost=item['avg_cost'],
                suggested_price=item['suggested_price'],
            )

    def test_gaming_catalog_products_are_listed(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()

        self.assertGreaterEqual(len(payload), 5)

        expected_names = {
            'PlayStation 5 Edición Digital',
            'PC Gamer Ryzen 7 RTX 4070',
            'HyperX Cloud III Wireless',
            'NVIDIA GeForce RTX 4070 Ti SUPER',
            'Silla Gamer Secretlab Titan Evo',
        }
        returned_names = {item['name'] for item in payload}
        for name in expected_names:
            self.assertIn(name, returned_names)

        expected_categories = {
            Product.ProductCategory.CONSOLES,
            Product.ProductCategory.GAMING_PCS,
            Product.ProductCategory.PERIPHERALS,
            Product.ProductCategory.COMPONENTS,
            Product.ProductCategory.ACCESSORIES,
        }
        returned_categories = {item['category'] for item in payload}
        for category in expected_categories:
            self.assertIn(category, returned_categories)

    def test_inventory_summary_endpoint(self):
        url = reverse('inventory-summary')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()

        self.assertIn('total_products', payload)
        self.assertEqual(payload['total_products'], 5)
        self.assertIn('total_stock_units', payload)
        self.assertIn('inventory_value_mxn', payload)
        self.assertIn('categories', payload)
        self.assertEqual(len(payload['categories']), 5)

        category_slugs = {item['category'] for item in payload['categories']}
        expected_categories = {
            Product.ProductCategory.CONSOLES,
            Product.ProductCategory.GAMING_PCS,
            Product.ProductCategory.PERIPHERALS,
            Product.ProductCategory.COMPONENTS,
            Product.ProductCategory.ACCESSORIES,
        }
        self.assertTrue(expected_categories.issubset(category_slugs))
