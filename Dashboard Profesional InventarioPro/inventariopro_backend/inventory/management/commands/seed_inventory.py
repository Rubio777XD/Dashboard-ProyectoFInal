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
        for index in range(10):
            product = Product.objects.create(
                name=f'Producto {index + 1}',
                code=f'P{index + 1:03d}',
                stock=Decimal('0'),
                low_threshold=Decimal('10'),
                avg_cost=Decimal('100.00') + Decimal(str(random.randint(0, 50))),
                suggested_price=Decimal('150.00') + Decimal(str(random.randint(0, 80))),
            )
            products.append(product)

        start_date = timezone.now().date() - timedelta(days=120)
        for _ in range(movements_count):
            product = random.choice(products)
            movement_type = random.choices(
                [Movement.MovementType.IN, Movement.MovementType.OUT],
                weights=[0.55, 0.45],
            )[0]
            quantity = Decimal(random.randint(1, 20))
            unit_price = Decimal(random.randint(80, 200))
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
