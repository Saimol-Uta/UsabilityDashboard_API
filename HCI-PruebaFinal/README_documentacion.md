# Informe de Documentacion — Usability Test Dashboard 2.0

Autor: Josue Fiallos
Duracion: 2 horas

## Resumen ejecutivo
Este informe presenta el proceso completo de mejora UX aplicado al sistema "Usability Test Dashboard 2.0". Se utilizo un enfoque HCI con Scrum para diagnosticar problemas, redisenar una pantalla critica y aplicar una mejora funcional real.

## Objetivo general
Aplicar principios de Interaccion Humano Computador, usabilidad, evaluacion heuristica, arquitectura de informacion, wireframes y diseno UX mediante mejoras reales, usando Scrum y control de versiones GitHub.

## Alcance
- Documentacion Scrum y evidencias.
- Evaluacion heuristica en Login, Dashboard, Formularios, Navegacion y Reportes.
- Redisenio conceptual del Dashboard mediante wireframes.
- Implementacion de breadcrumbs contextuales.

## Metodologia
1) Scrum basico: backlog, sprint planning y evidencias.
2) Evaluacion heuristica: criterios de Nielsen.
3) Diseno UX: jerarquia visual, Gestalt y navegacion contextual.
4) Implementacion funcional: breadcrumbs dinamicos.

## Entregables y evidencia
| Entregable | Archivo |
| --- | --- |
| Product Backlog | [HCI-PruebaFinal/product_backlog.md](HCI-PruebaFinal/product_backlog.md) |
| Sprint Planning | [HCI-PruebaFinal/sprint_planning.md](HCI-PruebaFinal/sprint_planning.md) |
| Evaluacion heuristica | [HCI-PruebaFinal/heuristic_evaluation.md](HCI-PruebaFinal/heuristic_evaluation.md) |
| Wireframes Lo-Fi | [HCI-PruebaFinal/wireframes/lofi.md](HCI-PruebaFinal/wireframes/lofi.md) |
| Wireframes Mid-Fi | [HCI-PruebaFinal/wireframes/midfi.md](HCI-PruebaFinal/wireframes/midfi.md) |
| Wireframes Hi-Fi | [HCI-PruebaFinal/wireframes/hifi.md](HCI-PruebaFinal/wireframes/hifi.md) |
| Evidencia IA | [HCI-PruebaFinal/ai_evidence.md](HCI-PruebaFinal/ai_evidence.md) |
| Implementacion UX | [HCI-PruebaFinal/implementation/README.md](HCI-PruebaFinal/implementation/README.md) |

## Resultados clave
- Identificacion de 12 problemas UX con severidad.
- Redisenio del dashboard con enfoque en jerarquia y navegacion.
- Breadcrumbs contextuales implementados en la UI.

## Cambios implementados
- Breadcrumbs dinamicos en el encabezado del layout.
- Refuerzo de la ubicacion del usuario en el flujo.

## Validacion
- Pruebas manuales navegando entre /planes, /tareas, /sesiones, /hallazgos.
- Verificacion del resaltado de la pagina actual en breadcrumbs.

## Conclusiones
La mejora aplicada incrementa la claridad de navegacion y reduce la carga cognitiva. La documentacion evidencia el proceso HCI y Scrum con entregables completos y trazables.

## Anexos
- Ruta de la implementacion: [frontend_beta/src/components/Layout.tsx](frontend_beta/src/components/Layout.tsx)
- Rama de trabajo: feature/PruebaFiallos
