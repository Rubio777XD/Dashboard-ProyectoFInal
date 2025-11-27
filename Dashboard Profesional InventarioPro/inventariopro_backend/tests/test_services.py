from __future__ import annotations

from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from inventory.models import Service

pytestmark = pytest.mark.xfail(
    reason='Los servicios ya no están expuestos en el panel ni en las rutas públicas.',
    strict=False,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def base_service(db):
    return Service.objects.create(
        name='Instalación de PC',
        code='SRV-001',
        category=Service.ServiceCategory.INSTALLATION,
        description='Armado y cableado limpio',
        price=Decimal('1299.00'),
        status=Service.ServiceStatus.ACTIVE,
    )


@pytest.mark.django_db
def test_service_crud_flow(api_client, base_service):
    list_url = reverse('service-list')
    response = api_client.get(list_url)
    assert response.status_code == 200
    assert len(response.json()) == 1

    payload = {
        'name': 'Garantía extendida',
        'code': 'SRV-002',
        'category': Service.ServiceCategory.WARRANTY,
        'description': 'Cobertura por 2 años',
        'price': '499.00',
        'status': Service.ServiceStatus.ACTIVE,
    }
    create_resp = api_client.post(list_url, payload, format='json')
    assert create_resp.status_code == 201

    detail_url = reverse('service-detail', args=[create_resp.json()['id']])
    patch_resp = api_client.patch(detail_url, {'status': Service.ServiceStatus.INACTIVE}, format='json')
    assert patch_resp.status_code == 200
    assert patch_resp.json()['status'] == Service.ServiceStatus.INACTIVE

    delete_resp = api_client.delete(detail_url)
    assert delete_resp.status_code == 204


@pytest.mark.django_db
def test_service_filters(api_client, base_service):
    Service.objects.create(
        name='Mantenimiento premium',
        code='SRV-003',
        category=Service.ServiceCategory.MAINTENANCE,
        description='Limpieza completa',
        price=Decimal('899.00'),
        status=Service.ServiceStatus.INACTIVE,
    )

    list_url = reverse('service-list')
    response = api_client.get(list_url, {'status': Service.ServiceStatus.ACTIVE})
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]['status'] == Service.ServiceStatus.ACTIVE

    price_filtered = api_client.get(list_url, {'min_price': '900', 'max_price': '1300'})
    assert price_filtered.status_code == 200
    assert len(price_filtered.json()) == 1


@pytest.mark.django_db
def test_service_search_by_name(api_client, base_service):
    Service.objects.create(
        name='Cableado empresarial',
        code='SRV-004',
        category=Service.ServiceCategory.INSTALLATION,
        description='Etiquetado y orden',
        price=Decimal('1599.00'),
        status=Service.ServiceStatus.ACTIVE,
    )

    list_url = reverse('service-list')
    response = api_client.get(list_url, {'name': 'cable'})
    assert response.status_code == 200
    payload = response.json()
    assert any('Cableado' in item['name'] for item in payload)
    assert all('Cableado' in item['name'] or 'cable' in item['name'].lower() for item in payload)


@pytest.mark.django_db
def test_service_filter_combination_returns_expected(api_client):
    """El endpoint debe combinar filtros de nombre, categoría y rango de precio."""

    service_a = Service.objects.create(
        name='Soporte básico',
        code='SRV-010',
        category=Service.ServiceCategory.MAINTENANCE,
        description='Soporte remoto',
        price=Decimal('299.00'),
        status=Service.ServiceStatus.ACTIVE,
    )
    Service.objects.create(
        name='Soporte premium',
        code='SRV-011',
        category=Service.ServiceCategory.MAINTENANCE,
        description='Soporte on-site',
        price=Decimal('1299.00'),
        status=Service.ServiceStatus.ACTIVE,
    )
    Service.objects.create(
        name='Instalación express',
        code='SRV-012',
        category=Service.ServiceCategory.INSTALLATION,
        description='Visita rápida',
        price=Decimal('499.00'),
        status=Service.ServiceStatus.INACTIVE,
    )

    list_url = reverse('service-list')
    response = api_client.get(
        list_url,
        {
            'name': 'soporte',
            'category': Service.ServiceCategory.MAINTENANCE,
            'min_price': '200',
            'max_price': '400',
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]['id'] == service_a.id
