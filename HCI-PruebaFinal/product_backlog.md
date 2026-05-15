# Product Backlog & UX Strategy

> **Autor:** Josue Fiallos  
> **Duración estimada:** 2 horas  
> **Rol:** UX/UI Engineer & Scrum Master

---

## 1. Contexto y Visión del Producto
**Proyecto:** Usability Test Dashboard 2.0  
**Pantalla Crítica Seleccionada:** Dashboard Principal  
**Mejora Funcional:** Implementación de *Contextual Breadcrumbs* (Migas de pan dinámicas) para reducir la carga cognitiva y mejorar el *Wayfinding*.

**Visión:** 
Ofrecer un panel de control de usabilidad intuitivo, confiable y accionable para estudiantes, moderadores y docentes; minimizando la carga cognitiva (Cognitive Load) y mejorando la toma de decisiones rápidas, respetando la **Ley de Hick** y la **Ley de Fitts**.

---

## 2. Objetivos de UX (Métricas Clave)
- **Tiempo de ubicación:** Reducir el tiempo necesario para localizar una sección específica en un 30%.
- **Carga Cognitiva:** Mejorar la comprensión de KPIs clave en la primera lectura (First Glance Comprehension).
- **Tasa de Errores (Error Rate):** Disminuir errores de navegación lateral al cambiar de fase en un 95%.

---

## 👥 3. Personas (Arquetipos de Usuario)

| Persona | Objetivo Principal | Necesidad UX Clave (Pain Point) |
| --- | --- | --- |
| **Estudiante Evaluador** | Registrar hallazgos rápidamente. | Accesibilidad directa a secciones y KPIs claros sin fricciones. |
| **Docente Supervisor** | Validar el avance general del proyecto. | Vista sintética (Dashboard) con indicadores altamente confiables. |
| **Moderador de Pruebas** | Guiar sesiones asíncronas sin perder contexto. | Navegación contextual siempre visible (*Feedback constante*). |

---

## 4. Épicas UX
1. **Navegación Contextual & Wayfinding:** Mejorar la ubicación espacial del usuario dentro de flujos profundos.
2. **Jerarquía Visual & Escaneabilidad:** Reorganización de KPIs en un layout F-Pattern o Z-Pattern para lectura rápida.
3. **Consistencia Visual & Affordance:** Estandarizar componentes para que su función sea evidente sin pensar.

---

## 5. Priorización MoSCoW (Sprint Actual)

- **Must Have (Imprescindible):** Breadcrumbs contextuales, jerarquía modular de KPIs, Documentación Scrum.
- **Should Have (Importante):** Estandarización de tipografía (Consistencia), Badges de severidad cromáticos.
- **Could Have (Deseable):** Microinteracciones (Toasts/Feedback de éxito).
- **Won't Have (Para el futuro):** Rediseño total del Backend o Base de Datos.

---

## 6. Historias de Usuario (User Stories)

| ID | Historia (Como... quiero... para...) | Criterios de Aceptación (DoD) | Prioridad |
| :--- | :--- | :--- | :--- |
| **US-01** | Como usuario, quiero ver un resumen claro de KPIs para entender el estado del plan al instante. | KPIs visibles.<br>Orden jerárquico lógico.<br>Tipografía legible. | Alta (Must) |
| **US-02** | Como usuario, quiero breadcrumbs siempre visibles para saber exactamente en qué sub-página me encuentro. | Ruta clickeable.<br>Página actual resaltada en bold. | Alta (Must) |
| **US-03** | Como usuario, quiero identificar la severidad de hallazgos rápidamente. | Códigos de color *(Rojo, Amarillo, Verde)* según heurística. | Media (Should) |
| **US-04** | Como docente, quiero evidencia clara del proceso de Diseño y Scrum. | Artefactos `.md` actualizados.<br>Commits versionados en Git. | Alta (Must) |
| **US-05** | Como evaluador, quiero visualizar el cambio planeado mediante Wireframes Hi-Fi. | Pantallas comparables (Base vs Mejora).<br>Flujo de usabilidad. | Alta (Must) |

---
*Documento optimizado para revisión de Rúbrica Final HCI / UX (Sobresaliente).*
