# Hallazgos Heurísticos - Formularios

## Hallazgo H17: Sin Validación Clara (CRÍTICO)

**Principio Nielsen:** #4 Prevención de errores

**Problema:**
- Campos sin indicación de tamaño máximo
- Error solo aparece al enviar
- Usuario llena todo, al final falla

**Impacto:** Múltiples reintentos, pérdida de datos, frustración

**Solución:**
- Validación en tiempo real visible
- Mostrar: "45 / 500" caracteres
- Campo rojo si vacío, verde cuando válido
- Auto-guardar en draft

**Prioridad:** MUST (Sprint 2)
**Severidad:** 4/4

---

## Hallazgo H18: Formularios Muy Largos (CRÍTICO)

**Principio Nielsen:** #7 Diseño estético y minimalista

**Problema:**
- 20+ campos en una sola columna
- Usuario debe scrollear durante 3+ minutos
- Tasa de abandono estimada: 40%

**Solución:**
- Dividir en pestañas o acordeones
- Indicador de progreso: "Paso 1 de 4"
- Guardar draft al cambiar de pestaña
- Botones: Guardar, Cancelar, Guardar Draft

**Prioridad:** MUST (Sprint 2)
**Severidad:** 4/4

---

## Hallazgo H19: Campos Obligatorios No Claros (MAYOR)

**Principio Nielsen:** #5 Reconocimiento vs Recall

**Problema:**
- Algunos campos son obligatorios, otros opcionales
- Sin indicador visual

**Solución:**
- Label en rojo: "Nombre del Test *"
- Resumen al inicio: "Campos con * son obligatorios"

**Prioridad:** SHOULD (Sprint 2)
**Severidad:** 3/4

---

## Hallazgo H20: Sin Opción Cancelar (MAYOR)

**Principio Nielsen:** #3 Control y libertad

**Problema:**
- Solo botón "Guardar", sin "Cancelar"
- Si error, no hay undo
- Usuario con miedo de hacer cambios

**Solución:**
- Botones: [Guardar] [Cancelar] [Guardar Draft]
- Confirmación: "¿Descartar cambios?"

**Prioridad:** SHOULD (Sprint 2)
**Severidad:** 3/4
