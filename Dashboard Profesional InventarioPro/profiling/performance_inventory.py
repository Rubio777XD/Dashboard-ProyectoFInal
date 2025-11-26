"""
Script de ejemplo para comparar una versión no optimizada vs. optimizada
del cálculo de totales de inventario. Se ejecuta con:

    python profiling/performance_inventory.py

Requiere que exista la base de datos de Django (usa settings locales). El
objetivo es mostrar cómo el acceso fila por fila es mucho más lento que las
agregaciones en base de datos.
"""

from __future__ import annotations

import os
import time
from decimal import Decimal
from typing import Iterable

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventariopro_backend.settings')

import django  # noqa: E402

django.setup()

from inventory.models import Movement  # noqa: E402
from services.reports import calculate_totals  # noqa: E402


def slow_totals(movements: Iterable[Movement]) -> dict[str, Decimal]:
    """Versión no optimizada: recorre todos los registros en Python."""

    ingresos = Decimal('0')
    egresos = Decimal('0')
    for movement in movements:
        value = movement.quantity * movement.unit_price
        if movement.movement_type == movement.MovementType.OUT:
            ingresos += value
        else:
            egresos += value
    return {
        'ingresos_mxn': ingresos.quantize(Decimal('0.01')),
        'egresos_mxn': egresos.quantize(Decimal('0.01')),
        'balance_mxn': (ingresos - egresos).quantize(Decimal('0.01')),
    }


def optimized_totals() -> dict[str, Decimal]:
    """Versión optimizada: delega el cálculo a agregaciones en SQL."""

    return calculate_totals(Movement.objects.all())


def benchmark() -> None:
    qs = Movement.objects.select_related('product').all()

    start = time.perf_counter()
    slow_result = slow_totals(list(qs))
    slow_time = time.perf_counter() - start

    start = time.perf_counter()
    fast_result = optimized_totals()
    fast_time = time.perf_counter() - start

    print('--- Perfilado de totales de inventario ---')
    print(f'Registros evaluados: {qs.count()}')
    print(f'Lento (Python loops): {slow_time:.6f}s -> {slow_result}')
    print(f'Rápido (agregaciones DB): {fast_time:.6f}s -> {fast_result}')
    print('\nNota: Ejecuta este script después de correr migrations y, opcionalmente,\n'
          'seed_inventory para ver mejor la diferencia de tiempos.')


if __name__ == '__main__':
    benchmark()
