# Versión simplificada de los tests existentes


### test_gaming_catalog_products_are_listed
Este test revisa que la lista de productos muestre varios artículos esperados y sus categorías.

# Tests simples:
def test_catalogo_correcto_1():
    productos = ["Consola", "PC Gamer", "Audífonos", "Tarjeta", "Silla"]
    assert "PC Gamer" in productos


def test_catalogo_correcto_2():
    categorias = {"consolas", "pcs", "perifericos"}
    assert "perifericos" in categorias


def test_catalogo_incorrecto_1():
    productos = ["Consola", "PC Gamer"]
    assert "Televisor" in productos  # Incorrecto a propósito


def test_catalogo_incorrecto_2():
    categorias = {"consolas", "pcs"}
    assert "accesorios" in categorias  # Incorrecto a propósito


### test_inventory_summary_endpoint
Este test valida que el resumen de inventario contenga totales y categorías completas.

# Tests simples:
def test_resumen_correcto_1():
    resumen = {"total_productos": 5, "categorias": ["A", "B", "C", "D", "E"]}
    assert resumen["total_productos"] == 5


def test_resumen_correcto_2():
    resumen = {"categorias": ["uno", "dos", "tres"]}
    assert len(resumen["categorias"]) >= 3


def test_resumen_incorrecto_1():
    resumen = {"total_productos": 2}
    assert resumen["total_productos"] == 10  # Incorrecto a propósito


def test_resumen_incorrecto_2():
    resumen = {"categorias": []}
    assert len(resumen["categorias"]) == 4  # Incorrecto a propósito


### test_currency_client_returns_rate
Este test comprueba que se obtenga una tasa de cambio al consultar un servicio externo.

# Tests simples:
def test_tasa_cambio_correcto_1():
    tasa = 17.56
    assert tasa > 0


def test_tasa_cambio_correcto_2():
    respuesta = {"MXN": 18.12}
    assert respuesta["MXN"] == 18.12


def test_tasa_cambio_incorrecto_1():
    tasa = -1
    assert tasa > 0  # Incorrecto a propósito


def test_tasa_cambio_incorrecto_2():
    respuesta = {"MXN": 19}
    assert respuesta["MXN"] == 10  # Incorrecto a propósito


### test_currency_client_returns_cached_on_error
Este test confirma que si falla la consulta, se usa la tasa guardada previamente.

# Tests simples:
def test_tasa_cache_correcto_1():
    tasa_guardada = 18.0
    tasa_actual = tasa_guardada
    assert tasa_actual == 18.0


def test_tasa_cache_correcto_2():
    ultimo_valor = 17.5
    error_red = True
    if error_red:
        tasa = ultimo_valor
    assert tasa == 17.5


def test_tasa_cache_incorrecto_1():
    tasa_guardada = 18.0
    tasa_actual = 15.0
    assert tasa_actual == tasa_guardada  # Incorrecto a propósito


def test_tasa_cache_incorrecto_2():
    ultimo_valor = 17.5
    error_red = True
    if error_red:
        tasa = 10
    assert tasa == ultimo_valor  # Incorrecto a propósito


### test_stock_updates_with_in_and_out
Este test verifica que si entran 10 productos y salen 4, el stock final es 6.

# Tests simples:
def test_stock_correcto_1():
    stock = 0
    stock = stock + 10
    stock = stock - 4
    assert stock == 6


def test_stock_correcto_2():
    stock = 5
    stock = stock + 3
    assert stock == 8


def test_stock_incorrecto_1():
    stock = 10
    stock = stock - 3
    assert stock == 20  # Incorrecto a propósito


def test_stock_incorrecto_2():
    stock = 2
    stock = stock + 2
    assert stock == 10  # Incorrecto a propósito


### test_updating_movement_adjusts_stock
Este test confirma que al actualizar un movimiento de entrada, el stock cambia al nuevo valor.

# Tests simples:
def test_actualizar_movimiento_correcto_1():
    stock = 0
    stock = stock + 10
    stock = 15  # se actualiza
    assert stock == 15


def test_actualizar_movimiento_correcto_2():
    stock = 5
    stock = stock + 5
    stock = stock + 2
    assert stock == 12


def test_actualizar_movimiento_incorrecto_1():
    stock = 10
    stock = 15
    assert stock == 5  # Incorrecto a propósito


def test_actualizar_movimiento_incorrecto_2():
    stock = 7
    stock = stock + 3
    assert stock == 20  # Incorrecto a propósito


### test_create_in_movement_endpoint
Este test asegura que crear una entrada suma unidades al stock.

# Tests simples:
def test_entrada_correcto_1():
    stock = 0
    entrada = 8
    stock += entrada
    assert stock == 8


def test_entrada_correcto_2():
    stock = 3
    stock += 2
    assert stock == 5


def test_entrada_incorrecto_1():
    stock = 1
    stock += 4
    assert stock == 10  # Incorrecto a propósito


def test_entrada_incorrecto_2():
    stock = 2
    stock += 1
    assert stock == 0  # Incorrecto a propósito


### test_create_out_movement_endpoint
Este test verifica que al registrar una salida, el stock disminuye correctamente.

# Tests simples:
def test_salida_correcto_1():
    stock = 12
    stock -= 5
    assert stock == 7


def test_salida_correcto_2():
    stock = 10
    stock = stock - 2
    assert stock == 8


def test_salida_incorrecto_1():
    stock = 5
    stock -= 2
    assert stock == 10  # Incorrecto a propósito


def test_salida_incorrecto_2():
    stock = 3
    stock = stock - 1
    assert stock == 5  # Incorrecto a propósito


### test_income_total_by_range
Este test calcula ingresos sumando ventas dentro de un periodo de fechas.

# Tests simples:
def test_ingresos_correcto_1():
    ventas = [100, 50, 5]
    total = sum(ventas)
    assert total == 155


def test_ingresos_correcto_2():
    ventas = [10, 10]
    assert sum(ventas) == 20


def test_ingresos_incorrecto_1():
    ventas = [5, 5]
    assert sum(ventas) == 100  # Incorrecto a propósito


def test_ingresos_incorrecto_2():
    ventas = [50]
    assert sum(ventas) == 0  # Incorrecto a propósito


### test_expense_total_by_range
Este test suma los gastos de un rango de fechas para obtener el total de egresos.

# Tests simples:
def test_egresos_correcto_1():
    compras = [40, 60]
    total = sum(compras)
    assert total == 100


def test_egresos_correcto_2():
    compras = [20]
    assert sum(compras) == 20


def test_egresos_incorrecto_1():
    compras = [30, 30]
    assert sum(compras) == 10  # Incorrecto a propósito


def test_egresos_incorrecto_2():
    compras = [5]
    assert sum(compras) == 0  # Incorrecto a propósito


### test_balance_calculation
Este test verifica que el balance sea ingresos menos egresos.

# Tests simples:
def test_balance_correcto_1():
    ingresos = 155
    egresos = 100
    balance = ingresos - egresos
    assert balance == 55


def test_balance_correcto_2():
    ingresos = 20
    egresos = 5
    assert ingresos - egresos == 15


def test_balance_incorrecto_1():
    ingresos = 10
    egresos = 8
    assert ingresos - egresos == 50  # Incorrecto a propósito


def test_balance_incorrecto_2():
    ingresos = 5
    egresos = 5
    assert ingresos - egresos == 10  # Incorrecto a propósito


### test_low_stock_detection
Este test revisa que si el stock es menor al mínimo, se detecta como bajo.

# Tests simples:
def test_stock_bajo_correcto_1():
    stock = 5
    minimo = 10
    bajo = stock < minimo
    assert bajo is True


def test_stock_bajo_correcto_2():
    stock = 2
    minimo = 3
    assert stock < minimo


def test_stock_bajo_incorrecto_1():
    stock = 12
    minimo = 10
    assert stock < minimo  # Incorrecto a propósito


def test_stock_bajo_incorrecto_2():
    stock = 5
    minimo = 4
    bajo = stock < minimo
    assert bajo is True  # Incorrecto a propósito


### test_dashboard_endpoint
Este test valida que el tablero devuelva varias métricas esperadas.

# Tests simples:
def test_dashboard_correcto_1():
    tablero = {"ingresos": 10, "egresos": 5, "balance": 5}
    assert "ingresos" in tablero and "balance" in tablero


def test_dashboard_correcto_2():
    tablero = {"productos": 3, "stock": 20}
    assert tablero["stock"] >= 0


def test_dashboard_incorrecto_1():
    tablero = {"balance": -1}
    assert "ingresos" in tablero  # Incorrecto a propósito


def test_dashboard_incorrecto_2():
    tablero = {"ingresos": 5}
    assert tablero.get("balance") == 0  # Incorrecto a propósito


### test_reports_endpoint_returns_series
Este test comprueba que el endpoint de reportes devuelva una serie de datos.

# Tests simples:
def test_reportes_correcto_1():
    respuesta = {"series": [1, 2, 3]}
    assert len(respuesta["series"]) >= 1


def test_reportes_correcto_2():
    respuesta = {"series": [5]}
    assert "series" in respuesta


def test_reportes_incorrecto_1():
    respuesta = {"series": []}
    assert len(respuesta["series"]) > 0  # Incorrecto a propósito


def test_reportes_incorrecto_2():
    respuesta = {}
    assert "series" in respuesta  # Incorrecto a propósito


### test_service_crud_flow
Este test recorre crear, editar y borrar un servicio verificando cada paso.

# Tests simples:
def test_servicio_crud_correcto_1():
    servicios = []
    servicios.append("Instalación")
    assert len(servicios) == 1


def test_servicio_crud_correcto_2():
    servicio = {"nombre": "Garantía", "estado": "activo"}
    servicio["estado"] = "inactivo"
    assert servicio["estado"] == "inactivo"


def test_servicio_crud_incorrecto_1():
    servicios = []
    servicios.append("X")
    servicios.remove("X")
    assert len(servicios) == 1  # Incorrecto a propósito


def test_servicio_crud_incorrecto_2():
    servicio = {"nombre": "Demo"}
    servicio["nombre"] = "Actualizado"
    assert servicio["nombre"] == "Demo"  # Incorrecto a propósito


### test_service_filters
Este test revisa que los filtros devuelvan solo servicios activos o en cierto rango de precios.

# Tests simples:
def test_filtros_servicio_correcto_1():
    servicios = [
        {"nombre": "A", "estado": "activo"},
        {"nombre": "B", "estado": "inactivo"},
    ]
    activos = [s for s in servicios if s["estado"] == "activo"]
    assert len(activos) == 1


def test_filtros_servicio_correcto_2():
    servicios = [
        {"nombre": "A", "precio": 100},
        {"nombre": "B", "precio": 500},
    ]
    baratos = [s for s in servicios if 50 <= s["precio"] <= 200]
    assert len(baratos) == 1


def test_filtros_servicio_incorrecto_1():
    servicios = [{"estado": "activo"}]
    activos = [s for s in servicios if s["estado"] == "activo"]
    assert len(activos) == 2  # Incorrecto a propósito


def test_filtros_servicio_incorrecto_2():
    servicios = [{"precio": 300}]
    baratos = [s for s in servicios if 0 <= s["precio"] <= 100]
    assert len(baratos) == 1  # Incorrecto a propósito


### test_service_search_by_name
Este test confirma que al buscar por nombre, los resultados contengan la palabra solicitada.

# Tests simples:
def test_busqueda_nombre_correcto_1():
    servicios = ["Cableado empresarial", "Instalación"]
    encontrados = [s for s in servicios if "cable" in s.lower()]
    assert any(encontrados)


def test_busqueda_nombre_correcto_2():
    servicios = ["Revisión", "Cableado rápido"]
    assert any("cable" in s.lower() for s in servicios)


def test_busqueda_nombre_incorrecto_1():
    servicios = ["Limpieza"]
    encontrados = [s for s in servicios if "cable" in s.lower()]
    assert any(encontrados)  # Incorrecto a propósito


def test_busqueda_nombre_incorrecto_2():
    servicios = ["Revisión"]
    assert any("cable" in s.lower() for s in servicios)  # Incorrecto a propósito


### test_service_filter_combination_returns_expected
Este test verifica que combinar filtros de nombre, categoría y precio devuelva solo el servicio adecuado.

# Tests simples:
def test_filtros_combinados_correcto_1():
    servicios = [
        {"nombre": "Soporte básico", "categoria": "mantenimiento", "precio": 299},
        {"nombre": "Soporte premium", "categoria": "mantenimiento", "precio": 1299},
    ]
    filtrados = [
        s
        for s in servicios
        if "soporte" in s["nombre"].lower()
        and s["categoria"] == "mantenimiento"
        and 200 <= s["precio"] <= 400
    ]
    assert len(filtrados) == 1


def test_filtros_combinados_correcto_2():
    servicios = [
        {"nombre": "Instalación", "categoria": "instalacion", "precio": 500},
        {"nombre": "Soporte", "categoria": "mantenimiento", "precio": 300},
    ]
    filtrados = [s for s in servicios if s["categoria"] == "mantenimiento" and s["precio"] < 400]
    assert len(filtrados) == 1


def test_filtros_combinados_incorrecto_1():
    servicios = []
    filtrados = [s for s in servicios if True]
    assert len(filtrados) == 1  # Incorrecto a propósito


def test_filtros_combinados_incorrecto_2():
    servicios = [
        {"nombre": "Soporte básico", "categoria": "mantenimiento", "precio": 299},
    ]
    filtrados = [s for s in servicios if s["precio"] > 1000]
    assert len(filtrados) == 1  # Incorrecto a propósito


### test_negative_quantity_should_be_rejected
Este test asegura que una cantidad negativa no cambia el stock y devuelve error.

# Tests simples:
def test_cantidad_negativa_correcto_1():
    stock = 10
    cantidad = -5
    if cantidad < 0:
        cambio = 0
    else:
        cambio = cantidad
    nuevo_stock = stock + cambio
    assert nuevo_stock == 10


def test_cantidad_negativa_correcto_2():
    stock = 5
    cantidad = -1
    if cantidad < 0:
        nuevo_stock = stock
    else:
        nuevo_stock = stock + cantidad
    assert nuevo_stock == 5


def test_cantidad_negativa_incorrecto_1():
    stock = 10
    cantidad = -3
    nuevo_stock = stock + cantidad
    assert nuevo_stock == 10  # Incorrecto a propósito


def test_cantidad_negativa_incorrecto_2():
    stock = 7
    cantidad = -2
    if cantidad < 0:
        nuevo_stock = stock + cantidad
    else:
        nuevo_stock = stock
    assert nuevo_stock == 7  # Incorrecto a propósito


### test_services_require_unique_names_across_status
Este test recuerda que no se permiten nombres duplicados de servicios aunque cambie el estado.

# Tests simples:
def test_nombres_unicos_correcto_1():
    nombres = {"Revision"}
    nuevo_nombre = "Revision"
    assert nuevo_nombre in nombres


def test_nombres_unicos_correcto_2():
    nombres = {"Revision", "Instalacion"}
    assert "Revision" in nombres


def test_nombres_unicos_incorrecto_1():
    nombres = {"Revision"}
    nuevo_nombre = "Revision"
    assert nuevo_nombre not in nombres  # Incorrecto a propósito


def test_nombres_unicos_incorrecto_2():
    nombres = set()
    nuevo_nombre = "Revision"
    nombres.add(nuevo_nombre)
    assert "Otro" in nombres  # Incorrecto a propósito


### test_export_services_placeholder
Este test es solo un recordatorio de que falta exportar servicios a CSV.

# Tests simples:
def test_export_placeholder_correcto_1():
    falta_exportar = True
    assert falta_exportar is True


def test_export_placeholder_correcto_2():
    pendiente = "CSV"
    assert pendiente == "CSV"


def test_export_placeholder_incorrecto_1():
    falta_exportar = False
    assert falta_exportar is True  # Incorrecto a propósito


def test_export_placeholder_incorrecto_2():
    pendiente = "CSV"
    assert pendiente == "JSON"  # Incorrecto a propósito


### test_mass_price_adjustment_placeholder
Este test señala que la función de ajustar precios masivamente aún no existe.

# Tests simples:
def test_ajuste_precios_correcto_1():
    pendiente = True
    assert pendiente


def test_ajuste_precios_correcto_2():
    mensaje = "falta implementar"
    assert "falta" in mensaje


def test_ajuste_precios_incorrecto_1():
    pendiente = False
    assert pendiente  # Incorrecto a propósito


def test_ajuste_precios_incorrecto_2():
    mensaje = "listo"
    assert "falta" in mensaje  # Incorrecto a propósito
