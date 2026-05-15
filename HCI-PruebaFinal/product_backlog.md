# Product Backlog

Autor: Josue Fiallos
Duracion: 2 horas

## Contexto
Proyecto: Usability Test Dashboard 2.0
Rol: UX Engineer
Pantalla critica seleccionada: Dashboard
Mejora funcional seleccionada: Breadcrumbs contextuales

## Alcance
- Incluye: dashboard, navegacion contextual, documentacion Scrum, wireframes y evidencia IA.
- Excluye: redisenio completo de todas las pantallas, cambios de backend.

## Supuestos y restricciones
- Repositorio publico y commits reales.
- No copiar disenios completos de internet.
- Tiempo estimado: 2 horas de trabajo individual.

## Vision del producto
Ofrecer un panel de control de usabilidad claro, confiable y accionable para estudiantes, moderadores y docentes, reduciendo la carga cognitiva y mejorando la toma de decisiones.

## Objetivos de UX (medibles)
- Reducir el tiempo para localizar una seccion en un 30%.
- Mejorar la comprension de KPIs clave en la primera lectura.
- Disminuir errores de navegacion al cambiar de fase.

## Personas (resumen)
| Persona | Objetivo | Necesidad clave |
| --- | --- | --- |
| Estudiante evaluador | Registrar hallazgos rapido | Acceso directo a secciones y KPIs claros |
| Docente supervisor | Validar avance del proyecto | Vista sintetica con indicadores confiables |
| Moderador de pruebas | Guiar sesiones sin perder contexto | Navegacion contextual visible |

## Epicas
1) Navegacion contextual y orientacion
2) Jerarquia visual y lectura rapida de KPIs
3) Consistencia visual y comunicacion de estado

## Requerimientos no funcionales (UX)
- Legibilidad: tipografia y contraste adecuados.
- Consistencia: patrones repetibles en cards y tablas.
- Tiempo de ubicacion: menor a 5 segundos.

## Priorizacion (MoSCoW)
- Must: imprescindible para el sprint
- Should: importante pero no bloqueante
- Could: deseable si hay tiempo
- Wont: fuera del sprint

## Historias de usuario
| ID | Historia | Criterios de aceptacion | Prioridad | Valor | Estado |
| --- | --- | --- | --- | --- | --- |
| US-01 | Como usuario, quiero ver un resumen claro de KPIs para entender el estado general del plan. | KPI visibles, ordenados por relevancia, con valores legibles. | Must | Alto | Pendiente |
| US-02 | Como usuario, quiero breadcrumbs visibles para ubicarme dentro del dashboard. | Breadcrumbs con ruta y pagina actual resaltada. | Must | Alto | Pendiente |
| US-03 | Como usuario, quiero acceso rapido a secciones clave desde el dashboard. | Accesos con etiquetas claras y rutas correctas. | Should | Medio | Pendiente |
| US-04 | Como usuario, quiero consistencia visual entre tarjetas y paneles. | Tipografia y espaciado coherentes. | Should | Medio | Pendiente |
| US-05 | Como usuario, quiero feedback de estado de acciones de mejora. | Barra de progreso y contadores visibles. | Must | Alto | Pendiente |
| US-06 | Como usuario, quiero identificar hallazgos por severidad rapidamente. | Colores y badges consistentes por severidad. | Should | Medio | Pendiente |
| US-07 | Como usuario, quiero navegacion lateral agrupada por fases. | Fases visibles con secciones ordenadas. | Must | Alto | Pendiente |
| US-08 | Como usuario, quiero ver mensajes de sistema sin perder contexto. | Toasts visibles y no invasivos. | Could | Bajo | Pendiente |
| US-09 | Como usuario, quiero que la app prevenga errores de plan activo. | Mensaje si no hay plan seleccionado. | Should | Medio | Pendiente |
| US-10 | Como usuario, quiero tiempos de carga claros para evitar confusion. | Spinner y texto de carga. | Must | Alto | Pendiente |
| US-11 | Como docente, quiero evidencia de proceso HCI y Scrum. | Documentacion clara y organizada. | Must | Alto | Pendiente |
| US-12 | Como evaluador, quiero wireframes Lo-Fi, Mid-Fi y Hi-Fi del dashboard. | Tres niveles documentados. | Must | Alto | Pendiente |

## Mapeo de historias a epicas
| Epica | Historias |
| --- | --- |
| Navegacion contextual | US-02, US-03, US-07, US-09 |
| Jerarquia visual | US-01, US-05, US-06, US-10 |
| Consistencia y estado | US-04, US-08, US-11, US-12 |

## Priorizacion de tareas (Sprint 1)
1) US-11 Documentacion Scrum y HCI (Must)
2) US-02 Breadcrumbs contextuales (Must)
3) US-12 Wireframes (Must)
4) US-01 Jerarquia visual KPI (Must)
5) US-05 Estado de acciones de mejora (Must)
6) US-03 Accesos rapidos (Should)

## Riesgos y mitigaciones
- Riesgo: datos incompletos en el dashboard. Mitigacion: estados vacios y mensajes claros.
- Riesgo: sobrecarga visual. Mitigacion: agrupar por bloques y limitar elementos por vista.

## Metricas de exito
- Tiempo promedio para encontrar una seccion: menor a 5s.
- Tasa de errores de navegacion: menor al 5%.
- Comprension de KPIs (prueba rapida): al menos 80%.

## Trazabilidad de entregables
| Entregable | Archivo |
| --- | --- |
| Sprint planning | [HCI-PruebaFinal/sprint_planning.md](HCI-PruebaFinal/sprint_planning.md) |
| Evaluacion heuristica | [HCI-PruebaFinal/heuristic_evaluation.md](HCI-PruebaFinal/heuristic_evaluation.md) |
| Wireframes | [HCI-PruebaFinal/wireframes/lofi.md](HCI-PruebaFinal/wireframes/lofi.md) |
| Evidencia IA | [HCI-PruebaFinal/ai_evidence.md](HCI-PruebaFinal/ai_evidence.md) |

