# Inventario Gamer Dashboard & API

Aplicación full-stack para administrar inventario gamer con métricas en tiempo real.
El backend está construido con Django REST Framework y el frontend con React + Vite +
Tailwind/Shadcn UI. Se incluyen datos de ejemplo con consolas, PC gamer, periféricos,
componentes y accesorios themed para gaming.

## Tecnologías principales

- **Backend:** Django 4, Django REST Framework, pytest
- **Frontend:** React 18, Vite, TypeScript, TailwindCSS, Shadcn UI, Recharts
- **Herramientas:** Sonner notifications, Lucide icons

## Requisitos

- Python 3.11+
- Node.js 18+
- npm o pnpm
- pip y (opcional) virtualenv

## Instalación rápida

```bash
git clone <repo>
cd "Dashboard Profesional InventarioPro"
```

### 1. Backend (Django)

```bash
cd inventariopro_backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py seed_inventory --movements 200
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend (React / Vite)

En otra terminal:

```bash
cd "Dashboard Profesional InventarioPro"
npm install
```

Configura la variable `VITE_API_URL` en `.env.local`:

```bash
VITE_API_URL=http://localhost:8000
```

Si no existe el archivo, crea uno llamado `.env.local` en la carpeta `src` con la variable anterior.

Inicia el servidor de desarrollo:

```bash
npm run dev -- --host
```

El panel quedará disponible en [http://localhost:5173](http://localhost:5173).

## Datos de ejemplo

El comando `python manage.py seed_inventory` genera un catálogo gamer completo:

- 5 **Consolas** (PS5, Xbox Series X, Nintendo Switch OLED, etc.)
- 5 **PCs gamer** (torres y portátiles)
- 5 **Componentes** (GPUs, CPUs, RAM, SSD)
- 5 **Periféricos** (mouse, teclados, headsets, monitores)
- 5 **Accesorios** y merch gamer

Los precios están en pesos mexicanos y los stocks se mantienen en un rango realista
(5 – 30 unidades) con movimientos de entrada/salida generados automáticamente para
probar las métricas del dashboard y los reportes.

## API REST

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET/POST | `/api/products/` | Lista y crea productos gamer. Filtros: `name`, `category`, `low_stock`. |
| GET/PATCH/DELETE | `/api/products/{id}/` | Obtiene, edita o elimina un producto. |
| GET | `/api/inventory/` | Resumen de inventario por categoría + listado de productos. |
| GET/POST | `/api/movements/` | Movimientos de inventario (entradas/salidas). Filtros: `product`, `start`, `end`, `limit`. |
| GET | `/api/dashboard/` | Totales de ventas, compras, balance, stock y valor inventario. |
| GET | `/api/reports/?from=YYYY-MM-DD&to=YYYY-MM-DD` | Series para gráficas y totales por rango. |
| GET/POST | `/api/services/` | CRUD de servicios con filtros `name`, `status`, `category`, `min_price`, `max_price` y `page_size`. |
| GET/PATCH/DELETE | `/api/services/{id}/` | Detalle, edición y eliminación de servicios. |

## Pruebas

```bash
cd inventariopro_backend
pytest
```

La suite incluye más de 20 pruebas. Algunas están marcadas como `xfail` con
razones explícitas para documentar funcionalidades futuras (p. ej., exportar
servicios a CSV o ajustes masivos de precios). El resto pasa en verde e incluye
validaciones de stock y unicidad de servicios.

## Perfilado de rendimiento

Ejemplo rápido comparando cálculo lento vs. optimizado:

```bash
python profiling/performance_inventory.py
```

Se imprime el tiempo de cada versión sobre los movimientos existentes en la base de datos.

## Configuración básica

La sección "Configuración" del frontend guarda preferencias en `localStorage`
(idioma, alertas y tamaño de página). El tamaño de página se usa en listados
como Servicios para limitar resultados a la cantidad elegida.

## Estructura del proyecto

```
inventariopro_backend/
  inventory/        # Modelos, vistas y serializers de inventario
  services/         # Servicios de dashboard y reportes
  tests/            # Suite de pytest
src/
  components/       # Componentes React del dashboard
  lib/              # utilidades de API y helpers
```

## Métricas destacadas del dashboard

- Ventas, compras y balance en MXN/USD
- Número total de productos gamer
- Stock disponible y valor estimado del inventario
- Productos en bajo stock por categoría
- Movimientos recientes con detalle de categoría

## Historial de cambios

Consulta `CHANGES.md` para el registro cronológico de mejoras.
