# Datos de Prueba para Demostración en Vivo: Usability Test Dashboard 2.0 📋🏥

Este archivo contiene datos de prueba realistas sobre un **nuevo tema**: la **Evaluación de Usabilidad del Portal de Citas Médicas de la Clínica "SaludVital"**. Puedes copiar y pegar estos textos en los formularios de tu aplicación durante la defensa del examen.

---

## 1. Formulario: Crear Plan de Pruebas (Test Plan)
*   **Nombre del Proyecto:** `Evaluación de Usabilidad: Portal de Reservas Clínica SaludVital`
*   **Producto Evaluado:** `Portal Web de Autogestión de Pacientes`
*   **Módulo Evaluado:** `Buscador de especialistas, selección de turnos e ingreso de seguro médico`
*   **Objetivo General:** `Identificar barreras heurísticas de navegación en el flujo de agendamiento de citas médicas para pacientes adultos, y evaluar la accesibilidad WCAG del formulario de ingreso de seguro.`
*   **Perfil de Usuario Meta:** `Pacientes adultos (30 a 65 años) que requieran atención médica periódica y posean niveles diversos de familiaridad con trámites en línea.`
*   **Metodología:** `Pruebas empíricas de usabilidad presenciales con protocolo de pensar en voz alta (Think Aloud).`
*   **Duración Estimada:** `25 minutos por participante`
*   **Alcance:** `Flujo completo desde la búsqueda del cardiólogo hasta la obtención del boleto de cita.`

---

## 2. Formulario: Agregar Tareas (Test Tasks)

### Tarea 1 (Flujo de Búsqueda)
*   **Número de Tarea:** `1`
*   **Escenario (Instrucciones para el usuario):** `Estás buscando un especialista en Cardiología disponible para consulta externa. Utiliza el buscador del portal para encontrar médicos disponibles, selecciona el horario de las 9:00 AM y avanza a la siguiente pantalla.`
*   **Resultado Esperado:** `El usuario localiza la especialidad, visualiza los médicos disponibles y selecciona el turno sin cometer clics erróneos.`
*   **Métrica Principal:** `Eficiencia (tiempo y cantidad de clics)`
*   **Criterio de Éxito:** `Selección del turno médico en menos de 4 clics y un tiempo menor a 60 segundos.`
*   **Tiempo Límite Estimado (segundos):** `60`

### Tarea 2 (Formulario de Seguro y Validación)
*   **Número de Tarea:** `2`
*   **Escenario (Instrucciones para el usuario):** `Ingresa tus datos personales y añade tu seguro de salud. Para evaluar la prevención de errores, introduce un código de seguro incorrecto mezclando letras (ej. "SALUD-123" cuando solo se permiten números) y describe qué ocurre.`
*   **Resultado Esperado:** `El portal impide el envío y muestra un mensaje inline detallando el formato esperado.`
*   **Métrica Principal:** `Prevención de errores y claridad de los textos de ayuda (Heurística #5)`
*   **Criterio de Éxito:** `El usuario comprende el error de inmediato, corrige el campo a números y el formulario avanza.`
*   **Tiempo Límite Estimado (segundos):** `90`

---

## 3. Formulario: Guion de Moderación (Moderator Script)
*   **Texto de Introducción / Bienvenida:**
    ```text
    Hola, bienvenido y gracias por tu tiempo. Hoy evaluaremos el portal web de reservas de la Clínica SaludVital. Queremos que agendar una cita médica sea lo más sencillo posible para todos los pacientes. Recuerda que evaluamos el portal, no a ti, por lo que no puedes equivocarte. Te pediré que pienses en voz alta durante todo el ejercicio: dime qué estás buscando, qué te llama la atención o si algo te resulta confuso. ¿Comenzamos?
    ```
*   **Preguntas de Seguimiento (Durante la sesión):**
    ```text
    ¿Qué esperas que ocurra al hacer clic en ese botón? ¿Te queda claro si el médico tiene cobertura con tu seguro? ¿Qué crees que significa la alerta en pantalla?
    ```
*   **Instrucciones de Cierre / Post-Test:**
    ```text
    Perfecto, hemos terminado las tareas. Para cerrar: ¿qué fue lo que más se te dificultó en el proceso de reserva? Si tuvieras que simplificar el portal para que lo use un adulto mayor, ¿qué cambiarías primero? Muchas gracias por tu valiosa colaboración.
    ```

---

## 4. Formulario: Registrar Participantes
*   **Participante 1 (Usuario Novato):**
    *   **Nombre:** `Marta Gómez`
    *   **Edad:** `58`
    *   **Perfil/Bio:** `Ama de casa. Utiliza WhatsApp a diario en su celular, pero casi nunca realiza trámites bancarios ni reservas en su computadora.`
*   **Participante 2 (Usuario Experto):**
    *   **Nombre:** `Jorge Ruiz`
    *   **Edad:** `34`
    *   **Perfil/Bio:** `Ingeniero Civil. Acostumbrado a realizar todos sus trámites, compras y reservas médicas vía web.`

---

## 5. Formulario: Registrar Sesiones de Prueba
*   **Sesión 1:**
    *   **Participante:** `Marta Gómez`
    *   **Plataforma Evaluada:** `Portal Web SaludVital (Desktop)`
    *   **Fecha:** `2026-06-10`
*   **Sesión 2:**
    *   **Participante:** `Jorge Ruiz`
    *   **Plataforma Evaluada:** `Portal Web SaludVital (Desktop)`
    *   **Fecha:** `2026-06-10`

---

## 6. Ejecución: Registro de Observaciones en Vivo (En Session Runner)
*   **Para la Sesión de Marta Gómez (Usuario Novato):**
    *   *Éxito de la Tarea 1 (Búsqueda):* `Sí` (marcar Checkbox)
    *   *Tiempo Empleado:* `55` segundos
    *   *Recuento de Errores:* `2`
    *   *Comentarios de Observación:* `Marta intentó buscar escribiendo "médico general" pero el buscador solo aceptaba especialidades exactas (ej. "Medicina General"). Esto le causó confusión inicial.`
    *   *Problema Detectado:* `Buscador estricto sin soporte de sinónimos ni búsquedas predictivas.`
    *   *Severidad:* `Medium`
    *   *Acción de Mejora Sugerida:* `Implementar autocompletado y reconocimiento semántico en el input de búsqueda.`

*   **Para la Sesión de Jorge Ruiz (Usuario Experto):**
    *   *Éxito de la Tarea 2 (Seguro):* `Sí` (marcar Checkbox)
    *   *Tiempo Empleado:* `35` segundos
    *   *Recuento de Errores:* `1`
    *   *Comentarios de Observación:* `El campo de seguro no muestra foco visible por teclado, lo que dificulta la navegación rápida, aunque el usuario experto lo resolvió con el mouse.`
    *   *Problema Detectado:* `Falta de foco accesible (outline) en los inputs del formulario.`
    *   *Severidad:* `High`
    *   *Acción de Mejora Sugerida:* `Añadir estilos CSS :focus-visible en el archivo index.css para los inputs del formulario.`

---

## 7. Formulario: Agregar Hallazgos (Findings)

### Hallazgo 1
*   **Descripción del Hallazgo:** `Ausencia de autocompletado predictivo en el buscador de especialidades.`
*   **Categoría:** `Búsqueda e Información`
*   **Severidad:** `Medium`
*   **Prioridad:** `Medium`
*   **Origen/Herramienta:** `Observación manual`
*   **Recomendación de Diseño:** `Implementar un menú desplegable interactivo que sugiera médicos y especialidades mientras el usuario escribe.`
*   **Frecuencia:** `1/2 usuarios`

### Hallazgo 2 (Accesibilidad)
*   **Descripción del Hallazgo:** `Los inputs del formulario médico carecen de foco visible (:focus) para navegación por teclado.`
*   **Categoría:** `Accesibilidad`
*   **Severidad:** `High`
*   **Prioridad:** `High`
*   **Origen/Herramienta:** `WAVE / Manual`
*   **Recomendación de Diseño:** `Configurar un borde azul de 2px con sombra suave al recibir el foco del teclado (WCAG 2.4.7 Foco Visible).`
*   **Frecuencia:** `2/2 usuarios`
