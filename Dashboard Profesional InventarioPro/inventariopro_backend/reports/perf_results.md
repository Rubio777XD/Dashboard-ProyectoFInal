# Resultados de perfilado

Ejecuta `python perf.py --movements 2000 --iterations 50` dentro de `inventariopro_backend/` para regenerar estas métricas.

- Movimientos generados: 2000
- Iteraciones timeit: 50
- Tiempo total calculate_totals: 1.8420 segundos

## cProfile /api/dashboard/

````
         120 function calls (112 primitive)
   Ordered by: cumulative time

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.005    0.005    0.022    0.022 inventory/views.py:28(get)
        1    0.003    0.003    0.017    0.017 services/reports.py:39(calculate_totals)
        3    0.002    0.001    0.010    0.003 django/db/models/query.py:1295(_fetch_all)
        1    0.001    0.001    0.009    0.009 services/reports.py:83(get_dashboard_metrics)
````

## Mejora aplicada

Se utilizan agregaciones `Sum` y `Case` directamente en la base de datos para calcular ingresos y egresos, reduciendo el número de bucles en Python y permitiendo que la base de datos aproveche índices sobre `movement_type` y `date`.
