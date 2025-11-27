from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Case, DecimalField, ExpressionWrapper, F, Sum, Value, When
from django.db.models.functions import Coalesce

from inventory.models import Movement, Product
from .currency import get_usd_to_mxn_rate

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


def _convert_mxn_to_usd(amount: Decimal, usd_to_mxn_rate: Decimal) -> Decimal:
    if usd_to_mxn_rate <= 0:
        return Decimal('0')
    return _quantize(amount / usd_to_mxn_rate)


def get_dashboard_metrics(start: date | None = None, end: date | None = None) -> dict[str, Decimal | int]:
    movements = Movement.objects.all()
    if start:
        movements = movements.filter(date__gte=start)
    if end:
        movements = movements.filter(date__lte=end)

    movement_value = _movement_value_expression()
    purchases_aggregates = movements.filter(movement_type=Movement.MovementType.IN).aggregate(
        purchases=Coalesce(Sum(movement_value), Value(0), output_field=MONEY_FIELD)
    )

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
    rate = get_usd_to_mxn_rate()

    purchases_mxn = _quantize(purchases_aggregates['purchases'] or Decimal('0'))
    purchases_usd = _convert_mxn_to_usd(purchases_mxn, rate)

    ingresos_usd = _convert_mxn_to_usd(totals['ingresos_mxn'], rate)
    egresos_usd = _convert_mxn_to_usd(totals['egresos_mxn'], rate)
    balance_usd = _convert_mxn_to_usd(totals['balance_mxn'], rate)

    return {
        **totals,
        'low_stock_count': low_stock_count,
        'product_count': product_count,
        'total_stock_units': _quantize(product_totals['total_stock'] or Decimal('0'), '0.01'),
        'inventory_value_mxn': _quantize(product_totals['inventory_value'] or Decimal('0')),
        'usd_rate': _quantize(rate, '0.0001'),
        'ingresos_usd': ingresos_usd,
        'egresos_usd': egresos_usd,
        'balance_usd': balance_usd,
        'purchases_mxn': purchases_mxn,
        'purchases_usd': purchases_usd,
    }


def get_range_report(start: date, end: date) -> dict:
    movements = Movement.objects.filter(date__gte=start, date__lte=end)
    totals = calculate_totals(movements)
    rate = get_usd_to_mxn_rate()

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
        'usd_rate': _quantize(rate, '0.0001'),
        'ingresos_usd': _convert_mxn_to_usd(totals['ingresos_mxn'], rate),
        'egresos_usd': _convert_mxn_to_usd(totals['egresos_mxn'], rate),
        'balance_usd': _convert_mxn_to_usd(totals['balance_mxn'], rate),
        'series': series,
    }
    return report
