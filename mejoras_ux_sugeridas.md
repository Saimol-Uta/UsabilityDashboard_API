# Propuesta de Mejoras UX/HCI para el Usability Test Dashboard 2.0 🚀💡

Esta guía técnica y conceptual responde a la pregunta de defensa del examen: **¿Qué mejora UX implementaría en su proyecto?**

---

## 1. Grabación Multimedia Integrada con Mapeo de Eventos en Vivo
* **¿En qué consiste?**  
  Implementar la captura directa de pantalla, cámara web y micrófono del participante desde el navegador usando el `MediaRecorder API` de HTML5 en la pantalla [SessionRunner.tsx](file:///D:/Proyectos/Univercidad/ExamenHCI/frontend_beta/src/pages/SessionRunner.tsx).
* **Beneficio UX / HCI:**  
  * **Reducción del Sesgo del Observador:** El moderador no tendrá que preocuparse por transcribir textualmente en el instante. Puede centrarse en guiar y observar el lenguaje no verbal.
  * **Línea de Tiempo Interactiva:** El sistema asociaría cada anotación u observación registrada al segundo exacto del video. Al revisar un hallazgo, el diseñador puede hacer clic en la observación y reproducir instantáneamente el video del usuario en ese preciso momento de frustración.

---

## 2. Análisis Automatizado de Sentimientos e Incidencias por IA (Whisper + LLM)
* **¿En qué consiste?**  
  Procesar el audio del micrófono del participante en tiempo real (mientras piensa en voz alta bajo el método *Think Aloud*) para transcribirlo y pasarlo por un modelo de análisis de sentimientos de lenguaje natural.
* **Beneficio UX / HCI:**  
  * **Detección Automática de Frustración:** Si el participante guarda silencio por más de 15 segundos o expresa duda verbalmente (ej. *"No entiendo"*, *"¿Dónde hago clic?"*), la IA colocará automáticamente un indicador de alerta en la línea de tiempo.
  * **Mapeo de Carga Mental:** Ayuda a medir cuantitativamente la frustración sin interrumpir el flujo de interacción del usuario.

---

## 3. Consola Multiusuario y Colaboración en Tiempo Real (SignalR / WebSockets)
* **¿En qué consiste?**  
  Habilitar una arquitectura WebSocket en la que múltiples investigadores de usabilidad puedan unirse a la misma sesión en vivo de forma remota.
* **Beneficio UX / HCI:**  
  * **Distribución de la Carga de Trabajo (Split-Tasking):** En pruebas profesionales, el rol de moderador (quien habla con el usuario) y el de observador (quien toma notas) deben estar separados para no sobrecargar de tareas a una sola persona.
  * **Sincronización Interactiva:** El moderador principal enfoca su atención social en el participante, mientras un observador externo registra los tiempos y fallos en silencio desde su propia consola conectada.

---

## 4. Exportación de Reportes Ejecutivos UX Automatizados (PDF)
* **¿En qué consiste?**  
  Un módulo de generación dinámica de informes que consolide los KPIs del plan, la distribución de hallazgos por severidad de usabilidad, y el nivel de conformidad de accesibilidad web (WCAG), exportándolos en un PDF limpio y formal con gráficos vectoriales.
* **Beneficio UX / HCI:**  
  * **Cierre del Lazo de Diseño Centrado en el Usuario (DCU):** Facilita la comunicación y el traspaso de datos analíticos hacia los directores de producto (*Product Owners*) y desarrolladores.
  * **Visualización Eficiente de la Información:** Traduce métricas técnicas en gráficos comprensibles de un vistazo.

---

## 5. Resiliencia a Fallos y Modo Offline (Sincronización PWA con IndexedDB)
* **¿En qué consiste?**  
  Convertir la interfaz en una Progressive Web App (PWA) e implementar almacenamiento local temporal mediante `IndexedDB` en el frontend.
* **Beneficio UX / HCI:**  
  * **Tolerancia a Errores de Conexión (Heurística #5 de Nielsen):** Si la prueba se ejecuta en una zona con mala conexión a internet y el servidor API se cae temporalmente, el moderador no perderá ningún dato del cronómetro, errores o notas. Toda la información se guarda de forma segura en el navegador y se sincroniza automáticamente al recuperar la señal.

---

> [!TIP]
> **Estrategia para responder en el Examen:**
> * Comienza diciendo: *"Si tuviéramos que escalar el proyecto a una versión 3.0, la mejora UX más prioritaria sería la **Grabación Multimedia Integrada con Mapeo de Eventos**, porque resuelve un problema real en HCI: el moderador sufre de una alta carga cognitiva al tener que escuchar, guiar, medir tiempos y escribir notas al mismo tiempo. Al grabar la pantalla y asociar las notas a la línea de tiempo del video, automatizamos el análisis y eliminamos el sesgo humano en el registro de observaciones".*
