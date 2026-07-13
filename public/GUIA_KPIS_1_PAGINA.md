# Guia rapida KPIs (1 pagina)

## Objetivo
Esta guia explica que cargar en KPIs para que el Dashboard muestre informacion confiable y accionable.

## Como se usa en la pagina
1. Crear KPI (solo una vez): nombre, objetivo de gestion, formula, frecuencia.
2. Cargar registro del periodo: valor actual y valor meta.
3. El sistema asigna estado:
- On track: valor_actual >= valor_meta
- En riesgo: valor_actual < valor_meta

## KPIs base y que cargar

### 1) Cobertura de servicios
- Para que sirve: medir cumplimiento operativo.
- Formula sugerida: (servicios cubiertos / servicios planificados) * 100
- Cargar valor actual: % real del periodo.
- Cargar valor meta: % objetivo (ejemplo 95).

### 2) Presentismo
- Para que sirve: controlar asistencia del personal asignado.
- Formula sugerida: (recursos presentes / recursos asignados) * 100
- Cargar valor actual: % real de presentismo.
- Cargar valor meta: % objetivo (ejemplo 97).

### 3) Horas trabajadas
- Para que sirve: controlar horas efectivas para operacion/liquidacion.
- Formula sugerida: suma de horas validadas.
- Cargar valor actual: horas reales del periodo.
- Cargar valor meta: horas objetivo del periodo.

### 4) Horas extras
- Para que sirve: detectar desvio de costos.
- Formula sugerida: total de horas extras aprobadas.
- Cargar valor actual: horas extras reales.
- Cargar valor meta: limite objetivo.

### 5) Ausentismo
- Para que sirve: anticipar impacto en cobertura.
- Formula sugerida: (ausencias / asignaciones) * 100
- Cargar valor actual: % real de ausentismo.
- Cargar valor meta: maximo aceptable.
- Nota: este KPI suele interpretarse al reves (menor es mejor).

### 6) Costo por objetivo
- Para que sirve: medir eficiencia economica.
- Formula sugerida: costo total / cantidad de objetivos.
- Cargar valor actual: costo real promedio.
- Cargar valor meta: costo objetivo maximo.
- Nota: tambien suele ser menor es mejor.

### 7) Tiempo de cobertura de vacante
- Para que sirve: medir velocidad de respuesta operativa.
- Formula sugerida: fecha-hora cobertura - fecha-hora vacante.
- Cargar valor actual: tiempo promedio real.
- Cargar valor meta: tiempo objetivo maximo.
- Nota: tambien suele ser menor es mejor.

## Estandar minimo de carga
- Usar siempre la misma unidad por KPI (% / horas / costo).
- Mantener mismo criterio de calculo en todos los periodos.
- Cargar datos reales, no estimados.
- Definir responsable de carga por KPI.

## Frecuencia recomendada
- Diaria/Semanal: cobertura, presentismo, ausentismo, tiempo de cobertura.
- Semanal/Mensual: horas trabajadas, horas extras, costo por objetivo.

## Plantilla de carga por periodo
- KPI: [nombre]
- Periodo: [mes/anio o semana]
- Valor actual: [numero]
- Valor meta: [numero]
- Fuente de datos: [sistema o planilla]
- Responsable: [nombre]
