from __future__ import annotations

import threading
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

import requests
from django.conf import settings

_CACHE_LOCK = threading.Lock()
_CACHE: dict[str, Optional[Decimal | datetime]] = {
    'rate': None,
    'timestamp': None,
}


def _is_cache_valid() -> bool:
    timestamp = _CACHE.get('timestamp')
    if not timestamp:
        return False
    return datetime.utcnow() - timestamp < timedelta(seconds=settings.CURRENCY_CACHE_TIMEOUT)


def _get_api_endpoint() -> str:
    base_url = (getattr(settings, 'EXCHANGE_API_URL', 'https://v6.exchangerate-api.com/v6') or '').rstrip('/')
    api_key = getattr(settings, 'EXCHANGE_API_KEY', '')
    return f"{base_url}/{api_key}/latest/USD"


def get_usd_to_mxn_rate() -> Decimal:
    with _CACHE_LOCK:
        if _CACHE['rate'] is not None and _is_cache_valid():
            return _CACHE['rate']  # type: ignore[return-value]

    fallback_rate = Decimal(getattr(settings, 'USD_MXN_FALLBACK_RATE', '18.0'))
    try:
        response = requests.get(_get_api_endpoint(), timeout=10)
        response.raise_for_status()
        payload = response.json()
        rate = Decimal(str(payload['conversion_rates']['MXN']))
    except Exception:
        with _CACHE_LOCK:
            cached_rate = _CACHE.get('rate')
        if cached_rate is not None:
            return cached_rate  # type: ignore[return-value]
        return fallback_rate

    with _CACHE_LOCK:
        _CACHE['rate'] = rate
        _CACHE['timestamp'] = datetime.utcnow()
    return rate
