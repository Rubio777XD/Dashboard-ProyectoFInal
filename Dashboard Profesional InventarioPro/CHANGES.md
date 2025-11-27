# Historial de cambios

# 2025-11-30
- Selects auditados para evitar valores vacíos; los `SelectItem` ahora exigen un `value` no vacío.
- Pantalla de Configuración simplificada a alertas de inventario con tarjeta centrada y preferencia única.
- Módulo de Servicios retirado (componente eliminado y endpoints desregistrados en backend).

# 2025-11-29
- Se ocultó el módulo de Servicios en el sidebar, enrutado y documentación; endpoints marcados como fuera de uso y pruebas XFAIL.
- Configuración simplificada a un único interruptor de alertas con tarjeta centrada y estilo consistente.
- Dashboard reorganizado en un grid 4x3 (7 tarjetas) sin romper el contenido de cada métrica.
- Revisados los Select de Productos para usar valores explícitos (sin cadenas vacías) y evitar errores de Radix.

# 2025-11-28
- Icono `Filter` importado correctamente en el Dashboard para evitar errores en tiempo de ejecución.
- Valores de `SelectItem` estandarizados en Productos y Servicios para que Radix no reciba cadenas vacías.
- Favicon agregado y referenciado desde `index.html` para eliminar el 404 del recurso.

# 2025-11-27
- Validaciones de inventario endurecidas (cantidades > 0 y sin stock negativo).
- Unicidad lógica del nombre de servicios y mensaje claro en API.
- Suite pytest en verde con xfail documentados y prueba nueva de filtros de servicios.
- Filtros de servicios (nombre, categoría, rango de precio) conectados en backend y frontend.
- Configuración básica persistida en localStorage y aplicada al tamaño de página.
- Script de perfilado documenta diferencias entre versión lenta y optimizada.

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
