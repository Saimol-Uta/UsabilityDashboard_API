# Evaluación Heurística — Usability Test Dashboard 2.0

**Evaluador:** Saimol Jiménez  
**Fecha:** 2026-05-15  
**Método:** Heurísticas de Usabilidad de Jakob Nielsen (10 heurísticas)  
**Sistema evaluado:** Usability Test Dashboard 2.0 (`http://localhost:5000`)

---

## Escala de Severidad

| Nivel | Descripción | Impacto |
|-------|-------------|---------|
| 🔴 **Crítico** | Problema que impide completar tareas fundamentales | El usuario no puede avanzar |
| 🟡 **Moderado** | Problema que dificulta la tarea pero no la impide | El usuario pierde tiempo o se confunde |
| 🟢 **Leve** | Problema cosmético o de consistencia menor | Genera fricción pero no bloquea |

---

## Problemas Identificados

### 🔴 Problemas Críticos (3)

---

#### P-01: Ausencia de indicador de progreso global en el Dashboard

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H1 — Visibilidad del estado del sistema |
| **Área afectada** | Dashboard |
| **Severidad** | 🔴 Crítico |
| **Descripción** | El Dashboard no ofrece ningún indicador visual que muestre al usuario en qué fase del proceso de prueba de usabilidad se encuentra (Preparación, Ejecución o Análisis). El usuario debe navegar manualmente por cada sección del sidebar para descubrir qué secciones ya completó y cuáles faltan. |
| **Evidencia** | Al ingresar al Dashboard, se muestran KPIs numéricos (observaciones, tasa de éxito, errores) pero no hay un stepper, barra de progreso ni indicador de fase actual. |
| **Recomendación** | Implementar un stepper visual de 3 fases (Preparación → Ejecución → Análisis) en la parte superior del Dashboard que muestre el estado actual y permita navegación contextual. Agregar barra de progreso global con porcentaje de completitud. |

---

#### P-02: Redirección silenciosa sin explicación al usuario

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H3 — Control y libertad del usuario |
| **Área afectada** | Navegación / Login inicial |
| **Severidad** | 🔴 Crítico |
| **Descripción** | Cuando un usuario nuevo ingresa al sistema sin haber creado un plan de prueba, es redirigido automáticamente desde cualquier ruta hacia `/planes` sin ningún mensaje explicativo. El usuario no entiende por qué fue redirigido ni qué debe hacer primero. |
| **Evidencia** | En `Layout.tsx` línea 48: `navigate('/planes', { replace: true })` se ejecuta sin feedback visual. |
| **Recomendación** | Mostrar un mensaje de bienvenida/onboarding que explique: "Para comenzar, crea o selecciona un plan de prueba". Considerar un modal de bienvenida para usuarios primerizos. |

---

#### P-03: Formulario permite fechas incoherentes sin validación preventiva

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H5 — Prevención de errores |
| **Área afectada** | Formularios (Plan de Prueba) |
| **Severidad** | 🔴 Crítico |
| **Descripción** | El formulario de creación/edición de Plan de Prueba permite al usuario seleccionar una fecha de fin anterior a la fecha de inicio. La validación solo ocurre al momento del submit (vía toast), no inline. El usuario puede llenar todo el formulario y recibir el error al final, perdiendo contexto. |
| **Evidencia** | En `TestPlans.tsx` línea 91: la validación `new Date(form.endDate) <= new Date(form.startDate)` solo se ejecuta en `handleSubmit`, no en el onChange del campo. |
| **Recomendación** | Implementar validación inline en tiempo real: al cambiar la fecha de inicio, actualizar el `min` de la fecha de fin. Mostrar mensaje de error debajo del campo con borde rojo si las fechas son incoherentes. |

---

### 🟡 Problemas Moderados (6)

---

#### P-04: Breadcrumbs redundantes e incompletos

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H4 — Consistencia y estándares |
| **Área afectada** | Navegación |
| **Severidad** | 🟡 Moderado |
| **Descripción** | Los breadcrumbs actuales muestran siempre "Dashboard > [Sección]", pero no incluyen la fase a la que pertenece la sección. En la página Dashboard, muestra "Dashboard > Dashboard" (redundante). |
| **Evidencia** | `Layout.tsx` líneas 330-334: breadcrumb estático con solo 2 niveles. |
| **Recomendación** | Implementar breadcrumbs de 3 niveles: "Inicio > Fase N — Nombre > Sección actual". Eliminar la redundancia en la página principal. |

---

#### P-05: Inconsistencia de terminología entre sidebar y páginas

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H2 — Correspondencia entre el sistema y el mundo real |
| **Área afectada** | Navegación / Reportes |
| **Severidad** | 🟡 Moderado |
| **Descripción** | El sidebar muestra "Observaciones" como elemento de navegación, pero la página de Hallazgos tiene el título "Síntesis de Hallazgos". Para el usuario, no queda claro si "Observaciones" y "Hallazgos" son la misma sección o secciones diferentes. |
| **Evidencia** | Sidebar: "Observaciones" → `/observaciones`. Página Findings: título "Síntesis de Hallazgos". Son secciones distintas pero la relación semántica es confusa. |
| **Recomendación** | Agregar subtítulos descriptivos consistentes. Asegurar que cada sección tenga terminología uniforme entre el sidebar, breadcrumbs y título de página. |

---

#### P-06: No hay reconocimiento de progreso sin revisar cada sección

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H6 — Reconocimiento antes que recuerdo |
| **Área afectada** | Dashboard |
| **Severidad** | 🟡 Moderado |
| **Descripción** | El usuario debe recordar mentalmente qué secciones ya completó en cada fase. No hay un resumen centralizado en el Dashboard que muestre "Fase 1: 2/2 completadas, Fase 2: 1/3 completadas". El sidebar tiene indicadores individuales pero requiere revisión visual de cada item. |
| **Recomendación** | Agregar un panel de resumen de completitud por fase en el Dashboard con contadores y barra de progreso por cada fase. |

---

#### P-07: Exceso de densidad informativa en items del sidebar

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H8 — Diseño estético y minimalista |
| **Área afectada** | Sidebar (Navegación) |
| **Severidad** | 🟡 Moderado |
| **Descripción** | Cada item del sidebar muestra simultáneamente: icono de estado (completado/pendiente), icono de sección, título, subtítulo descriptivo, y borde lateral de color. Con 8+ items visibles, la sobrecarga visual dificulta el escaneo rápido. |
| **Recomendación** | Considerar ocultar los subtítulos por defecto y mostrarlos solo en hover o con un toggle de vista compacta/extendida. |

---

#### P-08: Ausencia de guía de onboarding para usuarios nuevos

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H10 — Ayuda y documentación |
| **Área afectada** | General |
| **Severidad** | 🟡 Moderado |
| **Descripción** | Un usuario que accede por primera vez al sistema no recibe ninguna orientación sobre el flujo de trabajo esperado (crear plan → preparar → ejecutar → analizar). No hay tooltips, tutoriales interactivos ni documentación accesible. |
| **Recomendación** | Agregar quick-action cards en el Dashboard que guíen al usuario paso a paso: "Paso 1: Crea un plan de prueba", "Paso 2: Registra participantes", etc. |

---

#### P-09: Mensajes de error por toast efímeros y descontextualizados

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H9 — Ayudar a reconocer, diagnosticar y recuperarse de errores |
| **Área afectada** | Formularios |
| **Severidad** | 🟡 Moderado |
| **Descripción** | Los errores de validación se muestran como toasts en la esquina superior derecha que desaparecen en 3.5 segundos. El usuario pierde contexto porque el toast no señala cuál campo específico tiene el error. En formularios largos (Plan de Prueba con 10+ campos), esto obliga al usuario a buscar el campo problemático. |
| **Evidencia** | `App.tsx` línea 38: `setTimeout(() => ..., 3500)`. `TestPlans.tsx` líneas 84-91: cada validación genera un toast genérico. |
| **Recomendación** | Complementar los toasts con indicadores inline: borde rojo en el campo, mensaje de error debajo, scroll automático al primer campo inválido. |

---

### 🟢 Problemas Leves (3)

---

#### P-10: Dashboard sin accesos directos a acciones frecuentes

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H7 — Flexibilidad y eficiencia de uso |
| **Área afectada** | Dashboard |
| **Severidad** | 🟢 Leve |
| **Descripción** | El Dashboard muestra solo métricas pasivas (KPIs, gráficos) pero no ofrece accesos directos a las acciones más frecuentes como "Agregar observación", "Nueva sesión", "Registrar hallazgo". El usuario debe navegar por el sidebar para cada acción. |
| **Recomendación** | Agregar un grupo de "Quick Actions" con botones/tarjetas que enlacen directamente a las acciones más comunes o a las secciones incompletas. |

---

#### P-11: Botón de guardado sin indicador visual de carga

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H1 — Visibilidad del estado del sistema |
| **Área afectada** | Formularios |
| **Severidad** | 🟢 Leve |
| **Descripción** | Al hacer clic en "Guardar", el texto cambia a "Guardando..." pero no se muestra un spinner u otro indicador visual junto al texto. En conexiones lentas, el usuario no tiene certeza de que la acción se está procesando. |
| **Recomendación** | Agregar un spinner (icono animado) junto al texto "Guardando..." en todos los botones de submit. |

---

#### P-12: Estados del sistema en inglés en una interfaz en español

| Campo | Detalle |
|-------|---------|
| **Heurística violada** | H4 — Consistencia y estándares |
| **Área afectada** | Dashboard / Reportes |
| **Severidad** | 🟢 Leve |
| **Descripción** | Los estados internos "Draft", "InProgress", "Completed", "Cancelled" se filtran parcialmente a la interfaz en algunos badges y reportes, mientras toda la UI está en español. Aunque los badges principales ya tienen traducción, los datos crudos de la API a veces se muestran directamente. |
| **Recomendación** | Crear un helper de traducción de estados y aplicarlo consistentemente en todos los componentes. |

---

## Resumen de la Evaluación

| Severidad | Cantidad | Heurísticas afectadas |
|-----------|----------|----------------------|
| 🔴 Crítico | 3 | H1, H3, H5 |
| 🟡 Moderado | 6 | H2, H4, H6, H8, H9, H10 |
| 🟢 Leve | 3 | H1, H4, H7 |
| **Total** | **12** | **8 de 10 heurísticas** |

---

## Conclusión

El sistema presenta problemas significativos en **visibilidad del estado** (H1), **control del usuario** (H3) y **prevención de errores** (H5). Los problemas críticos se centran en la falta de orientación y feedback, lo que genera confusión en usuarios nuevos. Las mejoras propuestas se priorizan en el Sprint Planning para abordar primero los problemas de mayor impacto.
