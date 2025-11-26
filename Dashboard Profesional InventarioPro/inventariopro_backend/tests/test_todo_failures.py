"""
Pruebas que fallan a propósito para documentar requisitos pendientes.
Se dejan sin xfail para que pytest refleje los pendientes en el reporte.
"""

from __future__ import annotations

import pytest
from decimal import Decimal
from rest_framework.test import APIClient

from inventory.models import Movement, Product


@pytest.mark.django_db
def test_negative_quantity_should_be_rejected():
    """TODO: validar que las salidas no permitan cantidades negativas."""

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
    # Debería ser 400 cuando se agregue la validación de negocio
    assert response.status_code == 400


@pytest.mark.django_db
def test_services_require_unique_names_across_status():
    """TODO: consolidar catálogo evitando nombres duplicados aun con distinto estado."""

    from inventory.models import Service

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
        duplicate.full_clean()  # Esperado: falla cuando se implemente unicidad por nombre
