# Hallazgos Heurísticos - Pantalla de Login

## Hallazgo H01: Validaciones Inconsistentes (CRÍTICO)

**Principio Nielsen:** #4 Prevención de errores, #8 Prevención y recuperación

**Problema:**
- Sin validación en tiempo real de campos
- Mensaje de error genérico: "Credenciales inválidas"
- Usuario no sabe si falló email o contraseña
- Sin indicación de requisitos de contraseña

**Impacto:** Usuarios frustrados, múltiples intentos fallidos, inseguridad sobre qué dato es incorrecto

**Solución Propuesta:**
1. Validación inline por campo
2. Mensajes específicos: "Email no está registrado" vs "Contraseña incorrecta"
3. Indicadores visuales: Verde ✓ si válido, Rojo ✗ si error
4. Mostrar requisitos mientras se escribe

**Prioridad:** MUST (Sprint 1)
**Severidad:** 4/4

---

## Hallazgo H02: Sin Feedback Visual de Procesamiento (MAYOR)

**Principio Nielsen:** #1 Visibilidad del estado

**Problema:**
- Botón "Login" sin cambio visual al hacer click
- Usuario no sabe si la solicitud se está procesando
- Algunos usuarios hacen múltiples clicks

**Solución:**
- Mostrar spinner/loader
- Cambiar texto: "Ingresando..."
- Deshabilitar botón (disabled)

**Prioridad:** MUST (Sprint 1)
**Severidad:** 3/4

---

## Hallazgo H03: Sin Opción "Olvidé Contraseña" (MAYOR)

**Principio Nielsen:** #3 Control y libertad, #9 Ayuda

**Problema:**
- "Olvidé mi contraseña" no está visible
- Usuario bloqueado sin form de recuperación

**Solución:**
- Enlace debajo del campo de contraseña
- Modal de recuperación
- Email confirmation flow

**Prioridad:** SHOULD (Sprint 1)
**Severidad:** 3/4
