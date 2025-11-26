# Historial de cambios

# 2025-11-26
- CRUD de servicios con filtros y UI dedicada en el frontend.
- Configuración simplificada a idioma, paginación y alertas básicas.
- Ejemplo de perfilado `profiling/performance_inventory.py` con versión lenta vs optimizada.
- Suite de pruebas pytest ampliada (incluye casos que fallan intencionalmente para TODOs).
- Filtros en endpoints de productos, movimientos y servicios.

# 2025-02-14
- Inventario gamer con categorías para consolas, PCs gamer, periféricos, componentes y accesorios.
- Nuevo endpoint `/api/inventory/` con resumen por categoría y listado de productos.
- Semilla de datos actualizada con 25 productos gaming, precios en MXN y movimientos balanceados.
- Dashboard renovado con métricas de valor inventario, stock y conteo de productos reales desde la API.
- Frontend conectado al backend (VITE_API_URL) y menú de usuario/notificaciones mejorado.
- Prueba adicional que verifica la presencia del catálogo gamer en `/api/products/`.

## 2024-05-21
- Integración completa con backend Django REST (`inventariopro_backend`).
- Modelado de productos y movimientos con señales para stock y seeds de datos.
- Implementación de servicios de reportes y cliente de tipo de cambio con caché.
- Nuevos endpoints `/api/dashboard/` y `/api/reports/` consumidos por el frontend.
- Migración del frontend a datos reales en Dashboard, Productos, Movimientos y Reportes.
- Script de perfilado `perf.py` y reporte en `inventariopro_backend/reports/perf_results.md`.
- Añadido conjunto de pruebas `pytest` (10+) cubriendo cálculos y endpoints.
- Documentación actualizada en `README.md`.
