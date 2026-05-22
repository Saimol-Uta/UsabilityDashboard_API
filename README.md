
# Usability Test Dashboard 2.0 📊🧠

**Asignatura:** Interacción Humano / Computador (HCI)  
**Product Owner:** Saimol Jiménez  
**Stack Tecnológico:** .NET 10 + Entity Framework Core + React (TypeScript) + Vite  
**Gestión & IA:** GitHub Projects + GitHub Copilot

---

## 🎯 Propósito del Repositorio & Enfoque HCI
Este repositorio contiene el ecosistema completo del **Usability Test Dashboard 2.0**, un sistema diseñado para la gestión y seguimiento avanzado de pruebas de usabilidad. 

A diferencia de un desarrollo convencional, este proyecto implementa un enfoque de **Diseño Centrado en el Usuario (DCU)**. Cada componente UI y servicio técnico se ha desarrollado para mitigar dolores heurísticos identificados en fases anteriores, utilizando el control de versiones de GitHub como el mecanismo riguroso de auditoría y validación de interfaces.


---

## 🔁 El Flujo de Trabajo: Integración GitHub ⇄ HCI

Para asegurar la calidad, el equipo implementó un ciclo de vida estricto donde cada cambio de código debe validar un principio de usabilidad antes de mezclarse a `main`:


[Figma / Wireframes] ➔ [GitHub Issue (Prioridad MoSCoW)] ➔ [Feature Branch] ➔ [Asistencia con GitHub Copilot (IA)] ➔ [Pull Request + HCI Checklist] ➔ [Merge / Validación]


### 📊 Gestión del Backlog de Usabilidad
Todas las historias de usuario de la plataforma fueron incorporadas a nuestro **GitHub Project Board** bajo la metodología MoSCoW, atacando los problemas críticos encontrados en las evaluaciones de interfaces previas:

| ID | Historia de Usuario | Épica Asociada | Prioridad | Enfoque HCI Validado |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | Stepper de progreso por fases | Épica 1: Navegación y Orientación | **Must Have** | Heurística #1: Visibilidad del estado del sistema. Ubicación espacial. |
| **US-02** | Breadcrumbs dinámicos de ubicación | Épica 1: Navegación y Orientación | **Must Have** | Arquitectura de información, control del usuario y accesibilidad web. |
| **US-03** | Validaciones inline en tiempo real | Épica 2: Prevención de Errores | **Must Have** | Heurística #5: Prevención de errores crítica en interacción con formularios. |
| **US-04** | Tarjetas de acciones rápidas | Épica 3: Dashboard Inteligente | **Must Have** | Diseño emocional, motivación y reducción drástica de la carga cognitiva. |
| **US-05** | Barra de progreso global del plan | Épica 3: Dashboard Inteligente | **Should Have** | Feedback constante sobre el estado global de la tarea del evaluador. |
| **US-06** | Mensajes de error persistentes | Épica 2: Prevención de Errores | **Should Have** | Asistencia al usuario para reconocer, diagnosticar y recuperarse del error. |

### 🧪 Control de Evidencias y Calidad (Pull Requests)
No se realizan fusiones directas a la rama principal. El control de evidencias se gestiona mediante **Pull Requests (PR)**. Al abrir un PR, GitHub despliega automáticamente una plantilla de auditoría donde el revisor debe verificar manualmente que el código cargado cumpla con los estándares responsivos y heurísticos definidos en los criterios de aceptación.

### 🤖 Casos de Uso de Inteligencia Artificial (GitHub Copilot)
La IA actúa como un asistente de accesibilidad y usabilidad arquitectónica en nuestro entorno local:
* **Optimización Semántica (US-02):** Uso de Copilot para autocompletar la estructura semántica adaptada a lectores de pantalla utilizando propiedades `aria-label="breadcrumb"`, garantizando estándares internacionales de inclusión web.
* **Validación Lógica Real-Time (US-03):** Generación guiada por IA de algoritmos de comparación cronológica reactivos para inputs de fechas, evitando estados de error del sistema antes del submit.

---

## 🛠️ Configuración e Instalación Técnica (Entorno Local)

### Prerrequisitos
En Windows, instala y verifica lo siguiente:
1. .NET SDK 10 o superior
2. SQL Server local (instancia en `localhost`)
3. Node.js LTS (Recomendado Node 20+) y npm

Comandos de verificación:
```powershell
dotnet --version
node --version
npm --version

```

### Capas de la Arquitectura

* `UsabilityDashboard_API`: Proyecto de arranque de la API (Capa de Presentación Backend).
* `Application`: Capa de servicios, DTOs, validaciones y mapeos lógicos.
* `Domain`: Entidades principales y componentes puros de dominio.
* `Infrastructure`: Persistencia de datos, DbContext, repositorios y control de migraciones.
* `frontend_beta`: Aplicación web e interfaz de usuario SPA desarrollada en React/Vite.

### Configuración Inicial

1. Abre una terminal en la raíz del repositorio.
2. Verifica la cadena de conexión en `UsabilityDashboard_API/appsettings.json`.

Cadena actual esperada (Autenticación de Windows):

```json
"DefaultConnection": "Server=localhost;Database=UsabilityDashboardDb;Trusted_Connection=True;TrustServerCertificate=True"

```

### Ejecución de la API (Backend)

Desde la raíz del repositorio ejecute de forma secuencial:

```powershell
dotnet restore
dotnet ef database update --project .\Infrastructure --startup-project .\UsabilityDashboard_API
dotnet run --project .\UsabilityDashboard_API

```

* **Endpoint HTTP:** `http://localhost:5062` | **Endpoint HTTPS:** `https://localhost:7240`
* **Interfaz Swagger:** `http://localhost:5062/swagger`

### Ejecución del Frontend (Interfaz de Usuario)

En otra instancia de la terminal, desde la raíz del repositorio ejecute:

```powershell
cd .\frontend_beta
npm install
npm run dev

```

* **URL de Desarrollo:** `http://localhost:5173`
* *Nota:* El frontend implementa un proxy de Vite para redirigir las llamadas de `/api` directamente hacia `http://localhost:5062`.

---

## 🔁 Flujo Recomendado de Arranque

1. Iniciar el servicio local de SQL Server.
2. Aplicar las migraciones de Entity Framework para estructurar la base de datos de usabilidad.
3. Levantar la API en ASP.NET Core.
4. Inicializar el servidor de desarrollo de Vite para interactuar con el Frontend React.

---

## 💡 Solución de Problemas Frecuentes

1. **Error de conexión a SQL Server:** Confirma que SQL Server esté corriendo en `localhost` y revisa los privilegios de tu usuario actual de Windows sobre la base de datos.
2. **Error al aplicar migraciones (`dotnet ef` no reconocido):** Si la herramienta global no está disponible en tu CLI, instálala ejecutando:
`dotnet tool install --global dotnet-ef`
3. **El frontend no conecta con el backend:** Confirma que la API esté respondiendo adecuadamente en el puerto `5062`. Verifica la configuración del proxy inverso en el archivo `frontend_beta/vite.config.ts`.

