from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Case, DecimalField, ExpressionWrapper, F, Sum, Value, When
from django.db.models.functions import Coalesce

from inventory.models import Movement, Product
from .currency import get_mxn_to_usd_rate, get_usd_to_mxn_rate

MONEY_FIELD = DecimalField(max_digits=18, decimal_places=2)


def _movement_value_expression() -> ExpressionWrapper:
    return ExpressionWrapper(F('quantity') * F('unit_price'), output_field=MONEY_FIELD)


def _quantize(value: Decimal, places: str = '0.01') -> Decimal:
    return value.quantize(Decimal(places), rounding=ROUND_HALF_UP)


def calculate_totals(movements) -> dict[str, Decimal]:
    value_expression = _movement_value_expression()
    aggregates = movements.aggregate(
        ingresos=Coalesce(
            Sum(
                Case(
                    When(movement_type=Movement.MovementType.OUT, then=value_expression),
                    default=Value(0),
                    output_field=MONEY_FIELD,
                )
            ),
            Value(0),
            output_field=MONEY_FIELD,
        ),
        egresos=Coalesce(
            Sum(
                Case(
                    When(movement_type=Movement.MovementType.IN, then=value_expression),
                    default=Value(0),
                    output_field=MONEY_FIELD,
                )
            ),
            Value(0),
            output_field=MONEY_FIELD,
        ),
    )
    ingresos = aggregates['ingresos'] or Decimal('0')
    egresos = aggregates['egresos'] or Decimal('0')
    balance = ingresos - egresos
    return {
        'ingresos_mxn': _quantize(ingresos),
        'egresos_mxn': _quantize(egresos),
        'balance_mxn': _quantize(balance),
    }


def get_dashboard_metrics(start: date | None = None, end: date | None = None) -> dict[str, Decimal | int]:
    movements = Movement.objects.all()
    if start:
        movements = movements.filter(date__gte=start)
    if end:
        movements = movements.filter(date__lte=end)

    totals = calculate_totals(movements)
    low_stock_count = Product.objects.filter(stock__lte=F('low_threshold')).count()
    product_count = Product.objects.count()
    product_totals = Product.objects.aggregate(
        total_stock=Coalesce(Sum('stock'), Value(0), output_field=MONEY_FIELD),
        inventory_value=Coalesce(
            Sum(ExpressionWrapper(F('stock') * F('avg_cost'), output_field=MONEY_FIELD)),
            Value(0),
            output_field=MONEY_FIELD,
        ),
    )
    usd_to_mxn = get_usd_to_mxn_rate()
    mxn_to_usd = get_mxn_to_usd_rate()

    ingresos_usd = _quantize(totals['ingresos_mxn'] * mxn_to_usd)
    egresos_usd = _quantize(totals['egresos_mxn'] * mxn_to_usd)
    balance_usd = _quantize(totals['balance_mxn'] * mxn_to_usd)

    return {
        **totals,
        'low_stock_count': low_stock_count,
        'product_count': product_count,
        'total_stock_units': _quantize(product_totals['total_stock'] or Decimal('0'), '0.01'),
        'inventory_value_mxn': _quantize(product_totals['inventory_value'] or Decimal('0')),
        'usd_rate': _quantize(usd_to_mxn, '0.0001'),
        'ingresos_usd': ingresos_usd,
        'egresos_usd': egresos_usd,
        'balance_usd': balance_usd,
    }


def get_range_report(start: date, end: date) -> dict:
    movements = Movement.objects.filter(date__gte=start, date__lte=end)
    totals = calculate_totals(movements)
    usd_to_mxn = get_usd_to_mxn_rate()
    mxn_to_usd = get_mxn_to_usd_rate()

    series_qs = (
        movements.values('date')
        .order_by('date')
        .annotate(
            ingresos=Coalesce(
                Sum(
                    Case(
                        When(movement_type=Movement.MovementType.OUT, then=_movement_value_expression()),
                        default=Value(0),
                        output_field=MONEY_FIELD,
                    )
                ),
                Value(0),
                output_field=MONEY_FIELD,
            ),
            egresos=Coalesce(
                Sum(
                    Case(
                        When(movement_type=Movement.MovementType.IN, then=_movement_value_expression()),
                        default=Value(0),
                        output_field=MONEY_FIELD,
                    )
                ),
                Value(0),
                output_field=MONEY_FIELD,
            ),
        )
    )

    series = []
    for item in series_qs:
        ingresos = item['ingresos'] or Decimal('0')
        egresos = item['egresos'] or Decimal('0')
        balance = ingresos - egresos
        series.append(
            {
                'date': item['date'].isoformat(),
                'ingresos_mxn': _quantize(ingresos),
                'egresos_mxn': _quantize(egresos),
                'balance_mxn': _quantize(balance),
            }
        )

    report = {
        'range': {'from': start.isoformat(), 'to': end.isoformat()},
        **totals,
        'usd_rate': _quantize(usd_to_mxn, '0.0001'),
        'ingresos_usd': _quantize(totals['ingresos_mxn'] * mxn_to_usd),
        'egresos_usd': _quantize(totals['egresos_mxn'] * mxn_to_usd),
        'balance_usd': _quantize(totals['balance_mxn'] * mxn_to_usd),
        'series': series,
    }
    return report
