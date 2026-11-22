# CineForo v2 — Foro de cine y series

Proyecto de Desarrollo Fullstack III (Duoc UC). Sumativa 2: **FrontEnd en Angular + 3 microservicios
Spring Boot creados con arquetipo propio + Oracle Cloud + Docker**.

```
cineforo/
├── arquetipo/          Arquetipo Maven v1.1.0 (base de los 3 microservicios)
├── usuarios-ms/        Microservicio de usuarios, roles y login      → puerto 8081
├── foro-ms/            Microservicio de categorías, temas y comentarios → puerto 8082
├── moderacion-ms/      Microservicio de sanciones (banear/restaurar) → puerto 8083
├── cineforo-web/       FrontEnd Angular 22 + Bootstrap 5             → puerto 4200 (local y Docker)
├── scripts/            Scripts SQL para Oracle Cloud (Autonomous Database)
├── postman/            Colección Postman con 54 peticiones
├── docker-compose.yml  Levanta los 4 contenedores
└── .env.example        Variables para Docker (clave BD y usuario de Docker Hub)
```

## Arquitectura

```
                   ┌──────────────────────────┐   /api/auth, /api/usuarios, /api/roles
  Navegador ─────► │ cineforo-web (4200)      │ ───────────────────────► usuarios-ms (8081) ──┐
                   │ Angular + nginx (proxy)  │   /api/categorias, /temas, /comentarios      │
                   └──────────────────────────┘ ───────────────────────► foro-ms (8082) ──────┼──► Oracle Cloud ADB
                                                  /api/sanciones                               │    (Wallet)
  Postman ───────► 8081 / 8082 / 8083           ───────────────────────► moderacion-ms (8083) ┘
```

- Cada microservicio tiene **su propio esquema** en Oracle (USUARIOS_MS, FORO_MS, MODERACION_MS).
- El usuario que realiza la acción se envía en el header **`X-Usuario-Id`**; los permisos se validan por rol
  (USUARIO, MODERADOR, ADMINISTRADOR) consultando a usuarios-ms.
- **FrontEnd ↔ BackEnd:** Angular llama a los microservicios con `HttpClient` (`servicios/api.service.ts`).
  En Docker, nginx (contenedor `cineforo-web`) reenvía cada ruta `/api/...` al contenedor que corresponde;
  con `npm start`, lo hace `proxy.conf.json`. Las respuestas actualizan los **arreglos de Angular** (signals).
- Si los microservicios no responden, el FrontEnd sigue funcionando en **modo local** con sus arreglos.
  El pie de página indica el modo: *Conectado a los microservicios* o *Modo local*.

## Patrones de diseño

| Componente | Patrón | Dónde |
|---|---|---|
| Arquetipo / todos los ms | **Template Method** | `comun/patron/CrudServiceBase`: algoritmo CRUD fijo con pasos que cada servicio completa (`RolService`, `CategoriaService`) |
| usuarios-ms, foro-ms | **Builder** | `Usuario.builder()`, `Tema.builder()`, `Comentario.builder()` |
| moderacion-ms | **Strategy** | `estrategia/ModeracionStrategy` con `TemaModeracionStrategy` y `ComentarioModeracionStrategy`, elegidas según el tipo de contenido |
| Todos los ms | **Repository + DTO** | Spring Data JPA y records de entrada/salida |
| cineforo-web | **Facade** | `ForoFacade`: una sola puerta de entrada para las páginas; decide si va al microservicio o a los arreglos locales |
| cineforo-web | **Chain of Responsibility** | `usuarioInterceptor`: interceptor HTTP que agrega `X-Usuario-Id` a cada petición |
| cineforo-web | **Observer** | `SesionService` con *signals* |
| cineforo-web | **Singleton** | servicios `providedIn: 'root'` |

## Endpoints

| Microservicio | Método y ruta |
|---|---|
| usuarios-ms | `POST /api/auth/login` · `GET/POST /api/usuarios` · `GET/PUT/DELETE /api/usuarios/{id}` · `GET/POST /api/roles` · `GET/PUT/DELETE /api/roles/{id}` |
| foro-ms | `GET/POST /api/categorias` · `GET/PUT/DELETE /api/categorias/{id}` · `GET/POST /api/temas` · `GET/PUT/DELETE /api/temas/{id}` · `PUT /api/temas/{id}/estado` · `GET/POST /api/temas/{id}/comentarios` · `GET/PUT/DELETE /api/comentarios/{id}` · `PUT /api/comentarios/{id}/estado` |
| moderacion-ms | `GET /api/sanciones[?vigente=true]` · `GET /api/sanciones/{id}` · `POST /api/sanciones` (banea) · `PUT /api/sanciones/{id}` (motivo) · `DELETE /api/sanciones/{id}` (revoca y restaura) |

Errores en JSON: 400 validación · 401 sin `X-Usuario-Id` · 403 rol insuficiente · 404 no existe · 409 conflicto · 503 servicio caído.

## 1. Base de datos (Oracle Cloud)

1. En SQL Developer, conectado como **ADMIN**, ejecutar `scripts/00_crear_usuario_MODERACION_MS.sql`
   (cambiar la clave de ejemplo por la propia, entre comillas dobles).
2. Crear la conexión `foros_moderacion` (usuario MODERACION_MS, mismo Wallet, servicio `foros_tp`).
3. Ejecutar cada script con su usuario: `01_usuarios_ms.sql` (USUARIOS_MS), `02_foro_ms.sql` (FORO_MS),
   `03_moderacion_ms.sql` (MODERACION_MS).

## 2. Ejecutar en local

```bash
cp db-local.properties.example db-local.properties   # completar ruta del Wallet y clave
cd usuarios-ms   && mvn spring-boot:run                # 8081
cd foro-ms       && mvn spring-boot:run                # 8082
cd moderacion-ms && mvn spring-boot:run                # 8083
cd cineforo-web  && npm install && npm start           # http://localhost:4200
```

Importar `postman/CineForo.postman_collection.json` y ejecutar las carpetas en orden.
Usuarios de ejemplo (FrontEnd, clave `Cine2026!`): `admin_cineforo`, `ana_moderadora`, `juan_cinefilo`.

## 3. Crear un microservicio con el arquetipo

```bash
cd arquetipo && mvn clean install
mvn archetype:generate -DarchetypeGroupId=cl.duoc.arquetipos -DarchetypeArtifactId=microservicio-crud-archetype \
    -DarchetypeVersion=1.1.0 -DgroupId=cl.duoc.cineforo -DartifactId=moderacion-ms \
    -Dversion=1.0.0 -Dpackage=cl.duoc.cineforo.moderacion -DdbUser=MODERACION_MS -DserverPort=8083 \
    -DinteractiveMode=false
```

El proyecto generado ya trae: `Application`, `CorsConfig`, `CrudServiceBase` (Template Method),
excepciones y `ManejadorErrores`, `application.properties` con Wallet, **Dockerfile** y `.dockerignore`.

## 4. Docker (Docker Desktop)

Requisitos en la carpeta `cineforo`: el Wallet descomprimido en `wallet/` y un archivo `.env`
(copiar `.env.example`) con `DB_PASSWORD` y `DOCKERHUB_USER`.

```bash
docker compose up -d --build     # construye y levanta los 4 contenedores
docker compose ps                # estado
docker compose logs -f foro-ms   # logs de un servicio (Ctrl+C para salir)
docker compose push              # publica las imágenes en Docker Hub
docker compose down              # detiene todo
```

| Contenedor | URL |
|---|---|
| cineforo-web (Angular + nginx) | http://localhost:4200 |
| usuarios-ms | http://localhost:8081/api/roles |
| foro-ms | http://localhost:8082/api/categorias |
| moderacion-ms | http://localhost:8083/api/sanciones |

Imágenes publicadas en Docker Hub: `ludwiglindermann/cineforo-usuarios-ms`, `cineforo-foro-ms`,
`cineforo-moderacion-ms` y `cineforo-web`.

> Seguridad: `wallet/`, `db-local.properties` y `.env` están en `.gitignore` y **nunca** se suben ni se muestran en el video.

## Versionado (Git)

Ramas `main` (entregas) y `develop` (integración), con ramas `feature/*` por funcionalidad, fusionadas con
`--no-ff`. Etiquetas: `v1.0.0` (Sumativa 1) y `v2.0.0` (Sumativa 2).
