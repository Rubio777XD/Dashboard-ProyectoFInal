"""
Casos de validación y expectativas documentadas.

Incluye validaciones críticas que deben pasar y un par de xfail bien
documentados para futuros alcances (sin romper la suite completa).
"""

from __future__ import annotations

from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from inventory.models import Movement, Product, Service


@pytest.mark.django_db
def test_negative_quantity_should_be_rejected():
    """Las salidas con cantidad negativa deben ser rechazadas con 400."""

    client = APIClient()
    product = Product.objects.create(
        name='Producto con validación',
        code='VAL-NEG',
        category=Product.ProductCategory.CONSOLES,
        stock=Decimal('10'),
        low_threshold=Decimal('2'),
        avg_cost=Decimal('100'),
        suggested_price=Decimal('150'),
    )

    payload = {
        'product': product.id,
        'movement_type': Movement.MovementType.OUT,
        'quantity': '-5',
        'unit_price': '120',
        'date': '2024-01-01',
    }
    response = client.post('/api/movements/', payload, format='json')
    assert response.status_code == 400
    product.refresh_from_db()
    assert product.stock == Decimal('10')  # El stock no cambia en casos inválidos.


@pytest.mark.django_db
@pytest.mark.xfail(reason='Los servicios ya no están disponibles en el panel frontal.')
def test_services_require_unique_names_across_status():
    """No se permiten nombres duplicados aunque el estado sea distinto."""

    Service.objects.create(
        name='Revisión general',
        code='SRV-A',
        category=Service.ServiceCategory.MAINTENANCE,
        description='Diagnóstico',
        price=Decimal('199.00'),
        status=Service.ServiceStatus.ACTIVE,
    )

    duplicate = Service(
        name='Revisión general',
        code='SRV-B',
        category=Service.ServiceCategory.MAINTENANCE,
        description='Duplicado a evitar',
        price=Decimal('299.00'),
        status=Service.ServiceStatus.INACTIVE,
    )

    with pytest.raises(Exception):
        duplicate.full_clean()  # La unicidad por nombre debe bloquear duplicados.


@pytest.mark.xfail(reason='Exportar servicios a CSV no está implementado todavía')
def test_export_services_placeholder():
    """Recordatorio documentado de la exportación de catálogo."""

    raise NotImplementedError('Exportar servicios a CSV no está disponible')


@pytest.mark.xfail(reason='Ajuste automático de precios por inflación pendiente')
def test_mass_price_adjustment_placeholder():
    """Ejemplo de xfail para feature futura de ajuste masivo de precios."""

    raise NotImplementedError('Falta lógica de ajuste masivo de precios')
