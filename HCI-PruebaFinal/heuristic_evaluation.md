# Evaluación Heurística de Usabilidad (UX Audit)

> **Autor:** Josue Fiallos  
> **Metodología Oficial:** 10 Heurísticas de Usabilidad de Nielsen  
> **Duración estimada:** 2 horas  

---

## 1. Resumen Ejecutivo de la Auditoría
La auditoría se realizó recorriendo el *Happy Path* y los flujos alternativos de los módulos: **Login, Dashboard Principal, Formularios de Carga, Navegación General y Reportes**. 

Se diagnosticaron **12 problemas usables**, catalogados mediante una escala de severidad estandarizada, revelando fuertes carencias en *Accesibilidad Cognitiva* y *Prevención de Errores*.

---

## 2. Hallazgos UX Detallados (Min. 10 Problemas)

| ID | Módulo | Heurística Violada (Nielsen) | Descripción del Problema | Severidad | Solución Recomendada (Rediseño) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H-01** | Login | #5: Prevención de errores | El campo de contraseña no provee requisitos hasta luego del fallo. | 🟠 Moderado | Añadir validación *inline* (en tiempo real) y *Feedforward*. |
| **H-02** | Login | #1: Visibilidad del sistema | Fallo silencioso en credenciales (Solo marca rojo sin explicar). | Crítico | Desplegar un Toast/Banner explícito (*"Credenciales erróneas"*). |
| **H-03** | Dashboard | #8: Diseño estético / minimalista | KPIs amontonados sin contraste jerárquico. Todos "gritan" igual. | 🟠 Moderado | Aplicar **Ley de Proximidad**, rediseñar tarjetas con tamaños diferenciados por importancia. |
| **H-04** | Navegación | #3: Control del usuario | **Falta de orientadores profundos.** Usuario no sabe cuántos clicks dio. | Crítico | **IMPLEMENTAR BREADCRUMBS CONTEXTUALES (Tarea Técnica Seleccionada).** |
| **H-05** | Forms | #4: Consistencia y estándares | Botones de *Guardar* varían de estilo entre pantallas. | Leve | Estandarizar tokens en el UI Kit / Variables de Tailwind. |
| **H-06** | Forms | #9: Reconocer, diagnosticar errores | Errores genéricos tipo *"Campo inválido"* sin indicar la falla puntual. | 🟠 Moderado | Clarificar qué es inválido (*Ej. Faltan 2 letras numéricas*). |
| **H-07** | Sidebar | #1: Visibilidad del estado | El menú lateral no ilumina (active state) la sección actual. | Leve | Reforzar el estado pseudo-class `:active` en Tailwind. |
| **H-08** | Navegación | #6: Reconocimiento > Recuerdo | Al abrir un plan, el título del plan desaparece y cuesta recordarlo. | 🟠 Moderado | Anclar título superior estático en el Header Principal. |
| **H-09** | Reportes | #4: Consistencia | Filtros de fecha de reportes vs gráficas usan selectores distintos. | Leve | Usar el mismo componente Picker universal. |
| **H-10** | Reportes | #8: Interfaz minimalista | Gráficos sin *Tooltips* forzando a adivinar cifras pequeñas. | 🟠 Moderado | Agregar *Hover Affordance*. |
| **H-11** | Dashboard | #2: Empalme mundo real | Términos muy de BD (*Observaciones_v2*) expuestos al panel. | Leve | Utilizar *microcopy* humano (*"Observaciones Clave"*). |
| **H-12** | General | #7: Eficiencia de uso | Carencia de *Atajos / Shortcuts* (Ej. Ir al inicio, Volver). | Leve | Añadir link de 'Dashboard' interactivo en logo. |

---

## 3. Análisis Cuantitativo de Severidad
- **CRÍTICO (Causan bloqueo o altísima frustración):** 2 hallazgos (16.6%)
- 🟠 **MODERADO (Hacen lento el trabajo, causan errores corregibles):** 6 hallazgos (50.0%)
- **LEVE (Deseables por estética o menor fricción):** 4 hallazgos (33.3%)

---

## 4. Conclusión Orientadora al Desarrollo
Dado el alto impacto de **[H-04]** respecto a la *Desorientación del Usuario*, el **Rediseño Táctico** y la **Implementación Funcional (Fase 4)** se concentrarán exclusivamente en solventar este hallazgo crítico mediante un **Componente React de Breadcrumbs Dinámico**.
