# Hallazgos Heurísticos - Dashboard

## Hallazgo H07: Información Desorganizada (CRÍTICO)

**Principio Nielsen:** #7 Diseño estético y minimalista, #5 Reconocimiento vs Recall

**Problema:**
- Múltiples tablas sin jerarquía clara
- Usuario debe scrollear mucho para ver todo
- No queda claro cuál es la información más importante
- Mismo tamaño de fuente para KPIs críticos y secundarios

**Impacto:** Toma > 2 minutos entender qué está pasando, decisiones lentas en sesiones vivas

**Solución Propuesta:**
```
SECCIÓN 1: STATUS ACTUAL (Above the Fold)
- Tests activos: 5
- Sesiones en curso: 2
- Hallazgos nuevos: 12
- Botones de acción rápida

SECCIÓN 2: GRÁFICOS Y TENDENCIAS
- Mini gráfico: Hallazgos por día
- Mini gráfico: Tasa éxito

SECCIÓN 3: ACCIONES SUGERIDAS
- Recomendaciones basadas en datos
```

**Prioridad:** MUST (Sprint 1)
**Severidad:** 4/4

---

## Hallazgo H08: Sin Filtros (CRÍTICO)

**Principio Nielsen:** #6 Flexibilidad y eficiencia

**Problema:**
- Dashboard muestra toda la data sin forma de filtrar
- Buscar requiere memorizar o scrollear mucho

**Solución:**
- Filtros por sesión, fecha, participante
- Búsqueda global en header

**Prioridad:** SHOULD (Sprint 1-2)
**Severidad:** 4/4

---

## Hallazgo H09: Sin Indicadores de Severidad (MAYOR)

**Principio Nielsen:** #1 Visibilidad del estado

**Problema:**
- Todos los hallazgos mostrados igual
- Usuario debe leer cada uno para entender importancia

**Solución:**
- Código de colores: 🔴 Crítico, 🟠 Mayor, 🟡 Menor
- Cada card muestra icono de severidad
- Número de afectados

**Prioridad:** MUST (Sprint 2)
**Severidad:** 3/4
