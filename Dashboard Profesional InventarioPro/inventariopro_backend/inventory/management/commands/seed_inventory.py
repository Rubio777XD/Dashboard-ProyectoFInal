from __future__ import annotations

import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from inventory.models import Movement, Product


class Command(BaseCommand):
    help = 'Seed the database with demo products and movements.'

    def add_arguments(self, parser):
        parser.add_argument('--movements', type=int, default=200, help='Número de movimientos a generar')

    def handle(self, *args, **options):
        movements_count = options['movements']
        self.stdout.write('Limpiando datos existentes...')
        Movement.objects.all().delete()
        Product.objects.all().delete()

        random.seed(42)
        products: list[Product] = []

        catalog = [
            # Consolas
            {
                'name': 'PlayStation 5 Edición Digital',
                'code': 'CON-PS5-DIG',
                'category': Product.ProductCategory.CONSOLES,
                'avg_cost': Decimal('11800.00'),
                'suggested_price': Decimal('13999.00'),
                'low_threshold': Decimal('6'),
            },
            {
                'name': 'Xbox Series X 1TB',
                'code': 'CON-XSX-1TB',
                'category': Product.ProductCategory.CONSOLES,
                'avg_cost': Decimal('10900.00'),
                'suggested_price': Decimal('12999.00'),
                'low_threshold': Decimal('5'),
            },
            {
                'name': 'Nintendo Switch OLED',
                'code': 'CON-NSW-OLED',
                'category': Product.ProductCategory.CONSOLES,
                'avg_cost': Decimal('7800.00'),
                'suggested_price': Decimal('9399.00'),
                'low_threshold': Decimal('8'),
            },
            {
                'name': 'PlayStation 5 Slim',
                'code': 'CON-PS5-SLM',
                'category': Product.ProductCategory.CONSOLES,
                'avg_cost': Decimal('11500.00'),
                'suggested_price': Decimal('13799.00'),
                'low_threshold': Decimal('6'),
            },
            {
                'name': 'Xbox Series S',
                'code': 'CON-XSS-512',
                'category': Product.ProductCategory.CONSOLES,
                'avg_cost': Decimal('6400.00'),
                'suggested_price': Decimal('8299.00'),
                'low_threshold': Decimal('7'),
            },
            # PCs gamer
            {
                'name': 'PC Gamer Ryzen 7 RTX 4070',
                'code': 'PC-R7-4070',
                'category': Product.ProductCategory.GAMING_PCS,
                'avg_cost': Decimal('26500.00'),
                'suggested_price': Decimal('31999.00'),
                'low_threshold': Decimal('4'),
            },
            {
                'name': 'Laptop Gamer ROG Strix G16',
                'code': 'PC-ROG-G16',
                'category': Product.ProductCategory.GAMING_PCS,
                'avg_cost': Decimal('31500.00'),
                'suggested_price': Decimal('37999.00'),
                'low_threshold': Decimal('3'),
            },
            {
                'name': 'PC Gamer Intel i7 RTX 4060',
                'code': 'PC-I7-4060',
                'category': Product.ProductCategory.GAMING_PCS,
                'avg_cost': Decimal('23500.00'),
                'suggested_price': Decimal('28999.00'),
                'low_threshold': Decimal('4'),
            },
            {
                'name': 'Laptop Gamer MSI Katana 15',
                'code': 'PC-MSI-K15',
                'category': Product.ProductCategory.GAMING_PCS,
                'avg_cost': Decimal('22800.00'),
                'suggested_price': Decimal('27499.00'),
                'low_threshold': Decimal('4'),
            },
            {
                'name': 'Mini PC Gamer Ryzen 5 RX 6600',
                'code': 'PC-MINI-6600',
                'category': Product.ProductCategory.GAMING_PCS,
                'avg_cost': Decimal('18900.00'),
                'suggested_price': Decimal('23999.00'),
                'low_threshold': Decimal('5'),
            },
            # Componentes
            {
                'name': 'NVIDIA GeForce RTX 4070 Ti SUPER',
                'code': 'COMP-RTX4070T',
                'category': Product.ProductCategory.COMPONENTS,
                'avg_cost': Decimal('18999.00'),
                'suggested_price': Decimal('23499.00'),
                'low_threshold': Decimal('5'),
            },
            {
                'name': 'AMD Ryzen 7 7800X3D',
                'code': 'COMP-R77800',
                'category': Product.ProductCategory.COMPONENTS,
                'avg_cost': Decimal('9999.00'),
                'suggested_price': Decimal('12499.00'),
                'low_threshold': Decimal('6'),
            },
            {
                'name': 'Kingston Fury 32GB DDR5 6000',
                'code': 'COMP-RAM32',
                'category': Product.ProductCategory.COMPONENTS,
                'avg_cost': Decimal('2899.00'),
                'suggested_price': Decimal('3699.00'),
                'low_threshold': Decimal('8'),
            },
            {
                'name': 'Samsung 990 PRO SSD 2TB',
                'code': 'COMP-SSD2TB',
                'category': Product.ProductCategory.COMPONENTS,
                'avg_cost': Decimal('4999.00'),
                'suggested_price': Decimal('6399.00'),
                'low_threshold': Decimal('7'),
            },
            {
                'name': 'Asus ROG Strix B650E-F',
                'code': 'COMP-B650EF',
                'category': Product.ProductCategory.COMPONENTS,
                'avg_cost': Decimal('6399.00'),
                'suggested_price': Decimal('7999.00'),
                'low_threshold': Decimal('6'),
            },
            # Periféricos
            {
                'name': 'Logitech G Pro X Superlight 2',
                'code': 'PERI-GPXSL2',
                'category': Product.ProductCategory.PERIPHERALS,
                'avg_cost': Decimal('2899.00'),
                'suggested_price': Decimal('3899.00'),
                'low_threshold': Decimal('10'),
            },
            {
                'name': 'HyperX Cloud III Wireless',
                'code': 'PERI-HX-C3W',
                'category': Product.ProductCategory.PERIPHERALS,
                'avg_cost': Decimal('2899.00'),
                'suggested_price': Decimal('3699.00'),
                'low_threshold': Decimal('9'),
            },
            {
                'name': 'SteelSeries Apex Pro TKL',
                'code': 'PERI-APEXPRO',
                'category': Product.ProductCategory.PERIPHERALS,
                'avg_cost': Decimal('3999.00'),
                'suggested_price': Decimal('5099.00'),
                'low_threshold': Decimal('7'),
            },
            {
                'name': 'Razer Viper V3 Pro',
                'code': 'PERI-VIPER3',
                'category': Product.ProductCategory.PERIPHERALS,
                'avg_cost': Decimal('3399.00'),
                'suggested_price': Decimal('4399.00'),
                'low_threshold': Decimal('9'),
            },
            {
                'name': 'LG UltraGear 27" 240Hz OLED',
                'code': 'PERI-LG240O',
                'category': Product.ProductCategory.PERIPHERALS,
                'avg_cost': Decimal('11999.00'),
                'suggested_price': Decimal('14699.00'),
                'low_threshold': Decimal('4'),
            },
            # Merch y accesorios
            {
                'name': 'Control DualSense Galatic Purple',
                'code': 'ACC-DS-PUR',
                'category': Product.ProductCategory.ACCESSORIES,
                'avg_cost': Decimal('1499.00'),
                'suggested_price': Decimal('1999.00'),
                'low_threshold': Decimal('12'),
            },
            {
                'name': 'Silla Gamer Secretlab Titan Evo',
                'code': 'ACC-SL-TITAN',
                'category': Product.ProductCategory.ACCESSORIES,
                'avg_cost': Decimal('8999.00'),
                'suggested_price': Decimal('10999.00'),
                'low_threshold': Decimal('3'),
            },
            {
                'name': 'Base de Carga Xbox Razer Universal',
                'code': 'ACC-RZR-CHRG',
                'category': Product.ProductCategory.ACCESSORIES,
                'avg_cost': Decimal('1299.00'),
                'suggested_price': Decimal('1799.00'),
                'low_threshold': Decimal('10'),
            },
            {
                'name': 'Funda Rígida Nintendo Switch',
                'code': 'ACC-NSW-CASE',
                'category': Product.ProductCategory.ACCESSORIES,
                'avg_cost': Decimal('499.00'),
                'suggested_price': Decimal('799.00'),
                'low_threshold': Decimal('15'),
            },
            {
                'name': 'Kit Streaming Elgato Wave 3',
                'code': 'ACC-ELG-W3',
                'category': Product.ProductCategory.ACCESSORIES,
                'avg_cost': Decimal('3899.00'),
                'suggested_price': Decimal('4899.00'),
                'low_threshold': Decimal('6'),
            },
        ]

        current_stock: dict[int, Decimal] = {}
        product_data: dict[int, dict] = {}

        for item in catalog:
            initial_stock = Decimal(str(random.randint(8, 24)))
            product = Product.objects.create(
                name=item['name'],
                code=item['code'],
                category=item['category'],
                stock=initial_stock,
                low_threshold=item['low_threshold'],
                avg_cost=item['avg_cost'],
                suggested_price=item['suggested_price'],
            )
            products.append(product)
            current_stock[product.id] = initial_stock
            product_data[product.id] = item

        start_date = timezone.now().date() - timedelta(days=120)
        for _ in range(movements_count):
            product = random.choice(products)
            stock_now = current_stock[product.id]

            if stock_now <= Decimal('5'):
                movement_type = Movement.MovementType.IN
            elif stock_now >= Decimal('28'):
                movement_type = Movement.MovementType.OUT
            else:
                movement_type = random.choices(
                    [Movement.MovementType.IN, Movement.MovementType.OUT],
                    weights=[0.55, 0.45],
                )[0]

            if movement_type == Movement.MovementType.OUT:
                max_qty = int(min(stock_now, Decimal('6')))
                if max_qty <= 0:
                    movement_type = Movement.MovementType.IN
                else:
                    quantity = Decimal(str(random.randint(1, max_qty)))
            if movement_type == Movement.MovementType.IN:
                quantity = Decimal(str(random.randint(1, 6)))

            if movement_type == Movement.MovementType.OUT:
                stock_now -= quantity
            else:
                stock_now += quantity
            current_stock[product.id] = stock_now

            metadata = product_data[product.id]
            unit_price = metadata['avg_cost'] if movement_type == Movement.MovementType.IN else metadata['suggested_price']
            price_variation = Decimal(str(random.uniform(-0.1, 0.1)))
            unit_price = (unit_price * (Decimal('1') + price_variation)).quantize(Decimal('0.01'))
            movement_date = start_date + timedelta(days=random.randint(0, 120))

            Movement.objects.create(
                product=product,
                movement_type=movement_type,
                quantity=quantity,
                unit_price=unit_price,
                date=movement_date,
                note='Movimiento generado automáticamente',
            )

        self.stdout.write(self.style.SUCCESS('Datos de inventario generados correctamente.'))
