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
        mock_get.return_value.json.return_value = {'conversion_rates': {'MXN': 17.5678}}
        mock_get.return_value.raise_for_status.return_value = None
        rate = currency.get_usd_to_mxn_rate()
        self.assertEqual(rate, Decimal('17.5678'))

    @mock.patch('services.currency.requests.get')
    def test_currency_client_returns_cached_on_error(self, mock_get):
        mock_get.return_value.json.return_value = {'conversion_rates': {'MXN': 18.1234}}
        mock_get.return_value.raise_for_status.return_value = None
        first_rate = currency.get_usd_to_mxn_rate()
        self.assertEqual(first_rate, Decimal('18.1234'))

        mock_get.side_effect = Exception('network error')
        cached_rate = currency.get_usd_to_mxn_rate()
        self.assertEqual(cached_rate, Decimal('18.1234'))
