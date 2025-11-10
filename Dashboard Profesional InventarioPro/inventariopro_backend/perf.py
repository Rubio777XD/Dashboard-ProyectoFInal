from __future__ import annotations

import argparse
import cProfile
import io
import os
import pstats
import timeit
from datetime import datetime
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventariopro_backend.settings')

import django  # noqa: E402

django.setup()

from django.core.management import call_command  # noqa: E402
from rest_framework.test import APIRequestFactory  # noqa: E402

from inventory.models import Movement  # noqa: E402
from services import currency, reports  # noqa: E402
from inventory.views import DashboardView  # noqa: E402


def generate_data(count: int) -> None:
    if Movement.objects.count() >= count:
        return
    call_command('seed_inventory', movements=count)


def seed_rate() -> None:
    if currency._CACHE.get('rate') is None:
        currency._CACHE['rate'] = Decimal('0.05')
        currency._CACHE['timestamp'] = datetime.utcnow()


def measure_totals(iterations: int) -> float:
    stmt = 'reports.calculate_totals(Movement.objects.all())'
    setup = 'from services import reports\nfrom inventory.models import Movement'
    return timeit.timeit(stmt=stmt, setup=setup, number=iterations)


def profile_dashboard() -> str:
    factory = APIRequestFactory()
    request = factory.get('/api/dashboard/')
    view = DashboardView.as_view()

    profile = cProfile.Profile()
    profile.enable()
    view(request)
    profile.disable()

    stream = io.StringIO()
    stats = pstats.Stats(profile, stream=stream).sort_stats('cumulative')
    stats.print_stats(20)
    return stream.getvalue()


def main() -> None:
    parser = argparse.ArgumentParser(description='Performance profiler for inventory services')
    parser.add_argument('--movements', type=int, default=1000, help='Cantidad de movimientos a generar')
    parser.add_argument('--iterations', type=int, default=20, help='Iteraciones para timeit')
    args = parser.parse_args()

    seed_rate()
    generate_data(args.movements)
    total_time = measure_totals(args.iterations)
    profile_output = profile_dashboard()

    reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    results_path = os.path.join(reports_dir, 'perf_results.md')
    with open(results_path, 'w', encoding='utf-8') as handle:
        handle.write('# Resultados de perfilado\n\n')
        handle.write(f'- Movimientos generados: {args.movements}\n')
        handle.write(f'- Iteraciones timeit: {args.iterations}\n')
        handle.write(f'- Tiempo total calculate_totals: {total_time:.4f} segundos\n')
        handle.write('\n## cProfile /api/dashboard/\n\n')
        handle.write('````\n')
        handle.write(profile_output)
        handle.write('````\n')
        handle.write('\n## Mejora aplicada\n\n')
        handle.write('Se utilizan agregaciones con expresiones en base de datos para evitar bucles en Python y aprovechar índices.\n')

    print(f'Resultados guardados en {results_path}')


if __name__ == '__main__':
    main()
