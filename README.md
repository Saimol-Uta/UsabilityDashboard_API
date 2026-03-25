# ExamenHCI

Sistema para gestion y seguimiento de pruebas de usabilidad.

Este repositorio contiene:

- API backend en ASP.NET Core (.NET 10) con Entity Framework Core.
- Frontend en React + TypeScript + Vite.

## Tabla de contenido

- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Prerrequisitos](#prerrequisitos)
- [Configuracion inicial](#configuracion-inicial)
- [Ejecucion de la API (backend)](#ejecucion-de-la-api-backend)
- [Ejecucion del frontend](#ejecucion-del-frontend)
- [Flujo recomendado de arranque](#flujo-recomendado-de-arranque)
- [Verificacion rapida](#verificacion-rapida)
- [Comandos utiles](#comandos-utiles)
- [Solucion de problemas](#solucion-de-problemas)
- [Alcance de este README](#alcance-de-este-readme)

## Arquitectura del proyecto

- `UsabilityDashboard_API`: proyecto de arranque de la API.
- `Application`: capa de servicios, DTOs, validaciones y mapeos.
- `Domain`: entidades y componentes de dominio.
- `Infrastructure`: persistencia, DbContext, repositorios y migraciones.
- `frontend_beta`: aplicacion web React/Vite.

## Prerrequisitos

En Windows, instala y verifica lo siguiente:

1. .NET SDK 10 o superior
2. SQL Server local (instancia en `localhost`)
3. Node.js LTS (recomendado Node 20+) y npm

Comandos de verificacion:

```powershell
dotnet --version
node --version
npm --version
```

## Configuracion inicial

1. Abre una terminal en la raiz del repositorio.
2. Verifica la cadena de conexion en `UsabilityDashboard_API/appsettings.json`.

Cadena actual esperada:

```json
"DefaultConnection": "Server=localhost;Database=UsabilityDashboardDb;Trusted_Connection=True;TrustServerCertificate=True"
```

Nota: esta configuracion usa autenticacion de Windows (`Trusted_Connection=True`).

## Ejecucion de la API (backend)

Desde la raiz del repositorio:

```powershell
dotnet restore
dotnet ef database update --project .\Infrastructure --startup-project .\UsabilityDashboard_API
dotnet run --project .\UsabilityDashboard_API
```

URLs configuradas (perfil por defecto):

- HTTP: `http://localhost:5062`
- HTTPS: `https://localhost:7240`

Swagger:

- `http://localhost:5062/swagger`

## Ejecucion del frontend

En otra terminal, desde la raiz del repositorio:

```powershell
cd .\frontend_beta
npm install
npm run dev
```

URL de desarrollo:

- `http://localhost:5173`

Importante:

- El frontend usa proxy de Vite para `/api` hacia `http://localhost:5062`.
- Si la API no esta levantada, el frontend mostrara errores de red al consumir datos.

## Flujo recomendado de arranque

1. Iniciar SQL Server local.
2. Aplicar migraciones.
3. Levantar API.
4. Levantar frontend.

## Verificacion rapida

1. API responde en `http://localhost:5062/swagger`.
2. Frontend abre en `http://localhost:5173`.
3. En el navegador, la app carga sin errores 5xx en llamadas a `/api/*`.

## Comandos utiles

Backend:

```powershell
dotnet restore
dotnet build .\UsabilityDashboard_API\UsabilityDashboard_API.csproj
dotnet run --project .\UsabilityDashboard_API
```

Frontend:

```powershell
cd .\frontend_beta
npm run dev
npm run build
npm run lint
npm run preview
```

## Solucion de problemas

1. Error de conexion a SQL Server
	- Verifica que SQL Server este en ejecucion en `localhost`.
	- Revisa permisos de tu usuario de Windows sobre la instancia.

2. Error al aplicar migraciones
	- Ejecuta desde la raiz del repo el comando exacto:
	- `dotnet ef database update --project .\Infrastructure --startup-project .\UsabilityDashboard_API`
	- Si `dotnet ef` no esta disponible, instala herramienta global:
	- `dotnet tool install --global dotnet-ef`

3. Puerto ocupado (5062, 7240 o 5173)
	- Cierra el proceso que usa el puerto o cambia la configuracion local.

4. El frontend no conecta con la API
	- Confirma que la API corre en `http://localhost:5062`.
	- Verifica proxy en `frontend_beta/vite.config.ts`.
	- Revisa consola del navegador y terminal de Vite.

## Alcance de este README

Este documento cubre solo el setup y ejecucion local en entorno de desarrollo por CLI.

No cubre:

- Despliegue productivo
- Docker/containers
- Pipeline CI/CD