# Evaluacion Heuristica

Autor: Josue Fiallos
Duracion: 2 horas

## Alcance
Pantallas evaluadas: Login, Dashboard, Formularios, Navegacion, Reportes.
Heuristicas base: Nielsen (visibilidad, control, consistencia, prevencion de errores, etc.).

## Metodo
- Tipo: Evaluacion heuristica experta.
- Criterio: 10 heuristicas de Nielsen.
- Evidencia: observacion directa de la UI y flujo de tareas.

## Hallazgos (minimo 10)
| ID | Area | Heuristica | Problema detectado | Severidad | Impacto | Recomendacion |
| --- | --- | --- | --- | --- | --- | --- |
| H-01 | Login | Prevencion de errores | No se explica el formato esperado del usuario/clave. | Moderado | Reintentos y friccion. | Agregar placeholders y ayuda contextual. |
| H-02 | Login | Retroalimentacion | Falta feedback claro cuando credenciales fallan. | Critico | Bloqueo del acceso y confusion. | Mensaje de error visible y accionable. |
| H-03 | Dashboard | Jerarquia visual | KPIs se ven similares, no hay orden de importancia. | Moderado | Dificulta lectura rapida. | Resaltar KPIs clave y ordenar por prioridad. |
| H-04 | Dashboard | Navegacion | Breadcrumbs muy discretos, no se perciben como ruta. | Moderado | Desorientacion en el flujo. | Breadcrumbs con enlaces y separadores claros. |
| H-05 | Formularios | Consistencia | Campos y validaciones no son uniformes. | Leve | Curva de aprendizaje mayor. | Estandarizar componentes y mensajes. |
| H-06 | Formularios | Prevencion de errores | Validacion tardia (solo al enviar). | Moderado | Correcciones tardias y frustracion. | Validacion inline y mensajes inmediatos. |
| H-07 | Navegacion | Control del usuario | Menu lateral no indica claramente fase activa. | Leve | Duda sobre progreso. | Resaltar fase actual y estado. |
| H-08 | Navegacion | Visibilidad del estado | No hay indicador de plan activo en ciertas vistas. | Moderado | Confusion de contexto. | Mostrar plan activo en encabezado. |
| H-09 | Reportes | Consistencia | Titulos y filtros no siguen el mismo formato. | Leve | Percepcion de desorden. | Unificar patrones de filtros y headings. |
| H-10 | Reportes | Reconocimiento | Falta leyenda clara de graficas. | Moderado | Interpretacion incorrecta. | Agregar leyendas y tooltips. |
| H-11 | Dashboard | Diseño estetico | Paneles con exceso de informacion sin agrupacion. | Moderado | Sobrecarga cognitiva. | Agrupar por bloques con titulos claros. |
| H-12 | Formularios | Ayuda y documentacion | No hay ejemplos para campos complejos. | Leve | Llenado lento. | Agregar ejemplos y microcopy. |

## Resumen por area
| Area | Hallazgos | Severidad predominante |
| --- | --- | --- |
| Login | H-01, H-02 | Moderado/Critico |
| Dashboard | H-03, H-04, H-11 | Moderado |
| Formularios | H-05, H-06, H-12 | Leve/Moderado |
| Navegacion | H-07, H-08 | Leve/Moderado |
| Reportes | H-09, H-10 | Leve/Moderado |

## Resumen de severidad
- Criticos: 1
- Moderados: 7
- Leves: 4

## Mapeo rapido a heuristicas de Nielsen
- Visibilidad del estado: H-08
- Consistencia y estandares: H-05, H-09
- Prevencion de errores: H-01, H-06
- Reconocimiento mejor que recuerdo: H-10
- Estetica y diseno minimalista: H-11

## Escala de severidad
| Nivel | Descripcion | Accion sugerida |
| --- | --- | --- |
| Critico | Bloquea la tarea o provoca errores graves | Corregir de inmediato |
| Moderado | Afecta productividad o genera confusion | Corregir en el sprint |
| Leve | Mejora deseable sin bloqueo | Planificar mejora |

## Severidad
- Critico: bloquea la tarea o genera error grave.
- Moderado: afecta el rendimiento o aumenta la friccion.
- Leve: mejora deseable sin bloquear.

## Prioridad de correccion
1) H-02 (Critico)
2) H-03, H-04, H-06, H-08, H-10, H-11 (Moderados)
3) H-01, H-05, H-07, H-09, H-12 (Leves)

## Acciones recomendadas (resumen)
- Implementar breadcrumbs dinamicos (H-04).
- Resaltar KPIs clave (H-03).
- Validacion en tiempo real en formularios (H-06).

