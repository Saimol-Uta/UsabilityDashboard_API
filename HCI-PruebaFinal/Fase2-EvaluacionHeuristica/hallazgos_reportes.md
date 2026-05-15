# Hallazgos Heurísticos - Reportes

## Hallazgo H31: Sin Filtrado (CRÍTICO)

**Principio Nielsen:** #6 Flexibilidad y eficiencia

**Problema:**
- Reporte muestra TODOS los hallazgos sin filtros
- No puede filtrar por severidad, participante, fecha
- Usuario necesita Excel para análisis real

**Impacto:** Reporte de 500 hallazgos es inútil

**Solución:**
```
Filtros en header del reporte:
- Rango de fechas: [Start] [End]
- Test/Sesión: [Dropdown - múltiple select]
- Severidad: [Checkboxes] Crítico ☑ Mayor ☑ Menor ☐
- Participante: [Searchable dropdown]
- Estado: [Resuelto/Pendiente/En Progreso]

Mostrar: "Mostrando 45 de 120 hallazgos"
```

**Prioridad:** MUST (Sprint 3)
**Severidad:** 4/4

---

## Hallazgo H32: Gráficos Poco Informativos (MAYOR)

**Principio Nielsen:** #1 Visibilidad del estado

**Problema:**
- Gráficos pequeños, poco claros
- Eje Y sin escala visible
- Colores no tienen significado

**Solución:**
- Gráficos más grandes (responsive)
- Labels con porcentajes
- Tooltips al hover
- Colores = Severidad (🔴 Crítico, 🟠 Mayor)

**Prioridad:** SHOULD (Sprint 3)
**Severidad:** 3/4

---

## Hallazgo H33: Exportación Limitada (MAYOR)

**Principio Nielsen:** #6 Flexibilidad y eficiencia

**Problema:**
- Solo exportar a PDF
- No puede exportar a Excel para análisis

**Solución:**
- Botón "Descargar" con opciones:
  - PDF (formato presentación)
  - Excel (datos tabulares)
  - CSV (datos crudos)
  - PowerPoint (slides preformateadas)

**Prioridad:** SHOULD (Sprint 3)
**Severidad:** 3/4
