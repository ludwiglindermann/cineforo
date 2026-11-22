# CineForo v2 — Foro de cine y series

Proyecto de Desarrollo Fullstack III (Duoc UC). Sumativa 2: **FrontEnd en Angular + 3 microservicios
Spring Boot creados con arquetipo propio + Oracle Cloud + Docker**.

```
cineforo/
├── arquetipo/          Arquetipo Maven v1.1.0 (base de los 3 microservicios)
├── usuarios-ms/        Microservicio de usuarios, roles y login      → puerto 8081
├── foro-ms/            Microservicio de categorías, temas y comentarios → puerto 8082
├── moderacion-ms/      Microservicio de sanciones (banear/restaurar) → puerto 8083
├── cineforo-web/       FrontEnd Angular 22 + Bootstrap 5             → puerto 80 (Docker) / 4200 (local)
├── scripts/            Scripts SQL para Oracle Cloud (Autonomous Database)
├── postman/            Colección Postman con 54 peticiones
├── docker-compose.yml  Levanta los 4 contenedores
└── .env.example        Variables para Docker (clave BD y usuario de Docker Hub)
```

## Arquitectura

```
                   ┌────────────────────┐
  Navegador ─────► │ cineforo-web (80)  │  Angular: datos en arreglos + localStorage
                   └────────────────────┘
  Postman ──┬────► usuarios-ms (8081) ───────────────┐
            ├────► foro-ms (8082) ──► usuarios-ms     ├──► Oracle Cloud ADB (Wallet)
            └────► moderacion-ms (8083) ──► usuarios-ms, foro-ms   │  USUARIOS_MS / FORO_MS / MODERACION_MS
```

- Cada microservicio tiene **su propio esquema** en Oracle (USUARIOS_MS, FORO_MS, MODERACION_MS).
- El usuario que realiza la acción se envía en el header **`X-Usuario-Id`**; los permisos se validan por rol
  (USUARIO, MODERADOR, ADMINISTRADOR) consultando a usuarios-ms.
- Según el enunciado, el FrontEnd y el BackEnd **no necesitan comunicarse**: el FrontEnd usa arreglos de Angular.

## Patrones de diseño

| Componente | Patrón | Dónde |
|---|---|---|
| Arquetipo / todos los ms | **Template Method** | `comun/patron/CrudServiceBase`: algoritmo CRUD fijo con pasos que cada servicio completa (`RolService`, `CategoriaService`) |
| usuarios-ms, foro-ms | **Builder** | `Usuario.builder()`, `Tema.builder()`, `Comentario.builder()` |
| moderacion-ms | **Strategy** | `estrategia/ModeracionStrategy` con `TemaModeracionStrategy` y `ComentarioModeracionStrategy`, elegidas según el tipo de contenido |
| Todos los ms | **Repository + DTO** | Spring Data JPA y records de entrada/salida |
| cineforo-web | **Facade** | `ForoFacade`: una sola puerta de entrada para las páginas |
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

## 4. Docker en la nube (Play with Docker)

1. Entrar a <https://labs.play-with-docker.com>, iniciar sesión con Docker Hub y pulsar **+ ADD NEW INSTANCE**.
2. Clonar el repositorio:
   ```bash
   git clone https://github.com/<usuario>/cineforo.git && cd cineforo
   ```
3. Subir el Wallet: **arrastrar `Wallet_foros.zip` sobre la terminal** (queda en la carpeta actual) y luego:
   ```bash
   unzip Wallet_foros.zip -d wallet && rm Wallet_foros.zip
   ```
4. Crear el archivo `.env` (no se sube a Git):
   ```bash
   cp .env.example .env && vi .env      # DB_PASSWORD y DOCKERHUB_USER
   ```
5. Construir y levantar los 4 contenedores:
   ```bash
   docker compose up -d --build
   docker compose ps
   docker compose logs -f moderacion-ms   # Ctrl+C para salir
   ```
6. Arriba de la terminal aparecen los puertos **80, 8081, 8082 y 8083** como enlaces: cada uno abre la URL
   pública (`http://ipXXX-...-8081.direct.labs.play-with-docker.com`). Esas URLs se usan en Postman
   (variables `usuariosUrl`, `foroUrl`, `moderacionUrl`) y el puerto 80 abre el FrontEnd.
7. (Opcional) Publicar las imágenes en Docker Hub como registro de contenedores:
   ```bash
   docker login && docker compose push
   ```

> Seguridad: `wallet/`, `db-local.properties` y `.env` están en `.gitignore` y **nunca** se suben ni se muestran en el video.

## Versionado (Git)

Ramas `main` (entregas) y `develop` (integración), con ramas `feature/*` por funcionalidad, fusionadas con
`--no-ff`. Etiquetas: `v1.0.0` (Sumativa 1) y `v2.0.0` (Sumativa 2).
