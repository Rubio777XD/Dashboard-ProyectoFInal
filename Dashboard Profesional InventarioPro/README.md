# InventarioPro Dashboard & API

Este repositorio contiene el frontend en React + Vite + Tailwind generado desde Figma y un backend Django REST que provee la API y los datos requeridos por la aplicación.

## Requisitos

- Node.js 18+
- Python 3.11+
- pip / virtualenv

## Instalación

1. Clona el repositorio y entra en la carpeta del proyecto.
2. (Opcional) crea y activa un entorno virtual de Python.
3. Instala las dependencias de Python:

   ```bash
   pip install -r requirements.txt
   ```

4. Instala las dependencias del frontend:

   ```bash
   npm install
   ```

## Variables de entorno

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Clave secreta para Django | `dev-secret-key` |
| `DJANGO_DEBUG` | Activa modo debug (`true`/`false`) | `true` |
| `DJANGO_ALLOWED_HOSTS` | Hosts permitidos separados por coma | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Orígenes autorizados para CORS | `http://localhost:5173` |
| `CURRENCY_CACHE_TIMEOUT` | Caché para la tasa de cambio en segundos | `3600` |
| `VITE_API_URL` | URL base del backend que consumirá el frontend | `http://localhost:8000` |

Crea un archivo `.env` en el frontend con el valor adecuado para `VITE_API_URL` durante el desarrollo.

## Ejecución en desarrollo

### Backend (Django)

```bash
cd inventariopro_backend
python manage.py migrate
python manage.py seed_inventory --movements 200
python manage.py runserver 0.0.0.0:8000
```

### Frontend (React)

En otra terminal:

```bash
npm run dev -- --host
```

La aplicación estará disponible en `http://localhost:5173` consumiendo la API en `http://localhost:8000`.

## Despliegue / Build de producción

1. Genera el build del frontend:

   ```bash
   npm run build
   ```

2. Copia el contenido de `dist/` a `inventariopro_backend/frontend/` (crea la carpeta si no existe). El archivo `inventariopro_backend/frontend/index.html` será servido por Django.
3. Ejecuta `python manage.py collectstatic` (opcional) para preparar assets estáticos adicionales.
4. Inicia el servidor Django (por ejemplo con Gunicorn) apuntando a `inventariopro_backend.wsgi`.

## API principal

- `GET /api/products/` — Lista de productos.
- `POST /api/products/` — Crear producto.
- `GET /api/products/{id}/`, `PATCH /api/products/{id}/`, `DELETE /api/products/{id}/` — Operaciones sobre un producto.
- `GET /api/movements/` — Lista de movimientos.
- `POST /api/movements/` — Crear movimiento de entrada/salida.
- `GET /api/dashboard/` — Resumen general (ingresos, egresos, balance, bajo stock, conversión USD).
- `GET /api/reports?from=YYYY-MM-DD&to=YYYY-MM-DD` — Totales y series para gráficos en el rango indicado.

## Seed de datos

Genera datos de ejemplo ejecutando:

```bash
cd inventariopro_backend
python manage.py seed_inventory --movements 500
```

Esto crea 10 productos y movimientos aleatorios para pruebas.

## Pruebas

Ejecuta las pruebas (pytest + Django) desde `inventariopro_backend`:

```bash
pytest
```

Hay más de 10 pruebas cubriendo cálculos de stock, totales, endpoints y el cliente de la API externa.

## Perfilado

El script `inventariopro_backend/perf.py` genera datos, mide tiempos con `timeit` y corre `cProfile` sobre la vista de dashboard. Para ejecutarlo:

```bash
cd inventariopro_backend
python perf.py --movements 2000 --iterations 50
```

Los resultados se guardan en `inventariopro_backend/reports/perf_results.md`.

## Integración frontend-backend

- El frontend consume la API configurada en `VITE_API_URL`.
- Dashboard, Productos, Movimientos y Reportes utilizan datos reales devueltos por Django.
- En producción Django puede servir el build estático copiando los archivos a `inventariopro_backend/frontend/`.

## Comandos útiles

```bash
# Migraciones
python manage.py makemigrations
python manage.py migrate

# Superusuario
python manage.py createsuperuser

# Ejecutar servidor de desarrollo
python manage.py runserver 0.0.0.0:8000
```

## Estructura

```
inventariopro_backend/
  manage.py
  inventariopro_backend/
  inventory/
  services/
  tests/
  reports/
src/
  components/
  lib/
```

Consulta `CHANGES.md` para un historial de modificaciones relevantes.
