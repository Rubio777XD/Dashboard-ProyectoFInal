from __future__ import annotations

from decimal import Decimal
from unittest import mock

from django.test import SimpleTestCase

from services import currency


class CurrencyServiceTests(SimpleTestCase):
    def setUp(self):
        currency._CACHE['rate'] = None
        currency._CACHE['timestamp'] = None

    @mock.patch('services.currency.requests.get')
    def test_currency_client_returns_rate(self, mock_get):
        mock_get.return_value.json.return_value = {'rates': {'USD': 0.0567}}
        mock_get.return_value.raise_for_status.return_value = None
        rate = currency.get_mxn_to_usd_rate()
        self.assertEqual(rate, Decimal('0.0567'))

    @mock.patch('services.currency.requests.get')
    def test_currency_client_returns_cached_on_error(self, mock_get):
        mock_get.return_value.json.return_value = {'rates': {'USD': 0.0500}}
        mock_get.return_value.raise_for_status.return_value = None
        first_rate = currency.get_mxn_to_usd_rate()
        self.assertEqual(first_rate, Decimal('0.0500'))

        mock_get.side_effect = Exception('network error')
        cached_rate = currency.get_mxn_to_usd_rate()
        self.assertEqual(cached_rate, Decimal('0.0500'))
