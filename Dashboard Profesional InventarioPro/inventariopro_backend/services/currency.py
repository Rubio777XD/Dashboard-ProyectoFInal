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

API_URL = 'https://api.exchangerate.host/latest'


def _is_cache_valid() -> bool:
    timestamp = _CACHE.get('timestamp')
    if not timestamp:
        return False
    return datetime.utcnow() - timestamp < timedelta(seconds=settings.CURRENCY_CACHE_TIMEOUT)


def get_mxn_to_usd_rate() -> Decimal:
    with _CACHE_LOCK:
        if _CACHE['rate'] is not None and _is_cache_valid():
            return _CACHE['rate']  # type: ignore[return-value]

    params = {'base': 'MXN', 'symbols': 'USD'}
    try:
        response = requests.get(API_URL, params=params, timeout=10)
        response.raise_for_status()
        payload = response.json()
        rate = Decimal(str(payload['rates']['USD']))
    except Exception:
        with _CACHE_LOCK:
            cached_rate = _CACHE.get('rate')
        if cached_rate is not None:
            return cached_rate  # type: ignore[return-value]
        return Decimal('0')

    with _CACHE_LOCK:
        _CACHE['rate'] = rate
        _CACHE['timestamp'] = datetime.utcnow()
    return rate
