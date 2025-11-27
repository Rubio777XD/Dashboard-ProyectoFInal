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


def _get_default_rate() -> Decimal:
    fallback = settings.DEFAULT_USD_TO_MXN or '0'
    try:
        return Decimal(str(fallback))
    except Exception:
        return Decimal('0')


def _fetch_usd_to_mxn_rate() -> Decimal:
    api_url = settings.EXCHANGE_API_URL.rstrip('/')
    if not api_url:
        raise RuntimeError('EXCHANGE_API_URL is not configured')
    endpoint = f"{api_url}/{settings.EXCHANGE_API_KEY}/latest/USD"
    response = requests.get(endpoint, timeout=10)
    response.raise_for_status()
    payload = response.json()
    rate = payload.get('conversion_rates', {}).get('MXN')
    if rate is None:
        raise RuntimeError('Missing MXN rate in response')
    return Decimal(str(rate))


def get_usd_to_mxn_rate() -> Decimal:
    with _CACHE_LOCK:
        if _CACHE['rate'] is not None and _is_cache_valid():
            return _CACHE['rate']  # type: ignore[return-value]

    try:
        rate = _fetch_usd_to_mxn_rate()
    except Exception:
        with _CACHE_LOCK:
            cached_rate = _CACHE.get('rate')
        if cached_rate is not None:
            return cached_rate  # type: ignore[return-value]
        return _get_default_rate()

    with _CACHE_LOCK:
        _CACHE['rate'] = rate
        _CACHE['timestamp'] = datetime.utcnow()
    return rate


def get_mxn_to_usd_rate() -> Decimal:
    usd_to_mxn = get_usd_to_mxn_rate()
    if usd_to_mxn == 0:
        return Decimal('0')
    return Decimal('1') / usd_to_mxn
