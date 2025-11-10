# Historial de cambios

## 2024-05-21
- Integración completa con backend Django REST (`inventariopro_backend`).
- Modelado de productos y movimientos con señales para stock y seeds de datos.
- Implementación de servicios de reportes y cliente de tipo de cambio con caché.
- Nuevos endpoints `/api/dashboard/` y `/api/reports/` consumidos por el frontend.
- Migración del frontend a datos reales en Dashboard, Productos, Movimientos y Reportes.
- Script de perfilado `perf.py` y reporte en `inventariopro_backend/reports/perf_results.md`.
- Añadido conjunto de pruebas `pytest` (10+) cubriendo cálculos y endpoints.
- Documentación actualizada en `README.md`.
