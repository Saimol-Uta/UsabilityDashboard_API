# Implementación Code-Level (UX Upgrade)

> **Autor:** Josue Fiallos  
> **Duración estimada:** 2 horas  
> **Módulo modificado:** \Layout.tsx\ (Frontend - React/Tailwind)

---

## 1. La Mejora Aplicada: Breadcrumbs Dinámicos
Se refactorizó el encabezado principal del software para reemplazar un título estático poco informativo por **Breadcrumbs de Navegación Contextual** (Migas de Pan).

---

## 2. Fundamentación HCI aplicada
- **Visibilidad del Estado del Sistema (Nielsen #1):** El usuario sabe exactamente dónde está ubicado, en qué sección, y de dónde vino.
- **Control del Usuario (Nielsen #3):** Capacidad implícita de regresar o entender la estructura padre-hijo.
- **Carga Cognitiva (Cognitive Load):** Aliviada. No es necesario recordar en qué vista de la base de datos se entró, el sistema lo indica constantemente.

---

## 3. Abstract de la Arquitectura en Código
La lógica toma el estado subyacente (\location.pathname\) del eact-router-dom\ y lo escanea en tiempo real para parsear un menú jerárquico. 

\\	sx
// Snippet Concepto Central:
const breadcrumbs = [
  ...fasesEncontradas,
  seccionActiva
];
// Renderizado con flex-box y colores de estado (Tailwind)
\
---

## 4. Antes VS Después (Impacto)

| Métrica Cualitativa | Antes (Legacy) | Después (UX Refactored) |
| :--- | :--- | :--- |
| **Orientación Espacial** | Nula (Un solo título flotante). | Total (Rastro transversal de vistas). |
| **Confianza al navegar** | Baja (Miedo a cerrar el modal equivocado). | Alta (Se ve la estructura global de la app). |
| **Jerarquía** | Plana (Todo era texto H1). | Escalonada (Texto Gris/Pequeño para Padre -> Texto Bold para Activo). |

---

## 5. Validable (DoD Tester)
1. Navega usando el Sidebar.
2. Observa el Top-bar superior.
3. El texto no será estático, cambiará dinámicamente mostrando algo como: **Fase 2 / Mis Hallazgos**. El elemento activo siempre destacará en negrillas y color más fuerte (*Affordance visual*). Misión técnica cumplida.
