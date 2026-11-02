# CineForo – Sistema de Foros en Línea de Cine y Series

**DSY2205 Desarrollo Full Stack III – Experiencia 1, Semana 2: "Programando nuestro BackEnd"**

Backend de un foro de cine y series construido con **arquitectura de microservicios** en
**Java 17 + Spring Boot 3**, con base de datos **Oracle Autonomous Database (Oracle Cloud)**.

## Arquitectura

```
                 ┌─────────────────────────┐      REST (valida autor y rol)     ┌─────────────────────────┐
  Postman  ───►  │  usuarios-ms  :8081     │  ◄──────────────────────────────── │  foro-ms  :8082         │  ◄─── Postman
                 │  roles, usuarios, login │                                    │  categorías, temas,     │
                 └────────────┬────────────┘                                    │  comentarios, búsqueda  │
                              │ JPA                                             └────────────┬────────────┘
                              ▼                                                              │ JPA
                 ┌─────────────────────────┐                                    ┌────────────▼────────────┐
                 │ Esquema USUARIOS_MS     │        Oracle Cloud (foros)        │ Esquema FORO_MS         │
                 │ ROL, USUARIO            │                                    │ CATEGORIA, TEMA,        │
                 └─────────────────────────┘                                    │ COMENTARIO              │
                                                                                └─────────────────────────┘
```

- **Una base de datos por microservicio**: cada uno tiene su propio esquema (usuario Oracle)
  y solo accede a sus tablas.
- `foro-ms` guarda el `USUARIO_ID` del autor, pero **no** tiene una FOREIGN KEY hacia `USUARIO`:
  cuando necesita saber si un usuario existe o qué rol tiene, se lo **pregunta por REST** a `usuarios-ms`.
- Cada microservicio está organizado en capas: `controller` → `service` → `repository` → `model`,
  con `dto` para la entrada/salida JSON y `exception` para el manejo global de errores.

## Roles y privilegios

| Rol | Puede |
|---|---|
| **USUARIO** | registrarse, iniciar sesión, publicar temas, comentar, editar y eliminar **su propio** contenido y cuenta |
| **MODERADOR** | lo anterior + editar y eliminar temas y comentarios **de cualquier usuario** |
| **ADMINISTRADOR** | lo anterior + gestionar **usuarios** (roles, activar/desactivar, eliminar), **roles** y **categorías** |

Quien realiza cada acción se indica con el header **`X-Usuario-Id`**.
Si falta → `401`; si el rol no alcanza → `403`.

## Endpoints

### usuarios-ms (http://localhost:8081)

| Método | URL | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesión (nombre de usuario o email + contraseña) |
| GET | `/api/usuarios` | Lista usuarios (`?rol=MODERADOR` para filtrar) |
| GET | `/api/usuarios/{id}` | Obtiene un usuario |
| POST | `/api/usuarios` | Registra un usuario (rol USUARIO por defecto) |
| PUT | `/api/usuarios/{id}` | Modifica un usuario (él mismo o un ADMINISTRADOR) |
| DELETE | `/api/usuarios/{id}` | Elimina un usuario (ADMINISTRADOR) |
| GET | `/api/roles` · `/api/roles/{id}` | Lista u obtiene roles |
| POST · PUT · DELETE | `/api/roles` · `/api/roles/{id}` | Gestiona roles (ADMINISTRADOR) |

### foro-ms (http://localhost:8082)

| Método | URL | Descripción |
|---|---|---|
| GET | `/api/categorias` · `/api/categorias/{id}` | Lista u obtiene categorías |
| POST · PUT · DELETE | `/api/categorias` · `/api/categorias/{id}` | Gestiona categorías (ADMINISTRADOR) |
| GET | `/api/temas` | **Busca** temas: `?categoriaId=` `?autorId=` `?q=texto` (combinables) |
| GET | `/api/temas/{id}` | **Visualiza** un tema con sus comentarios |
| POST | `/api/temas` | **Publica** un tema |
| PUT · DELETE | `/api/temas/{id}` | Edita o elimina un tema (autor, MODERADOR o ADMINISTRADOR) |
| GET | `/api/temas/{temaId}/comentarios` | Lista los comentarios de un tema |
| POST | `/api/temas/{temaId}/comentarios` | **Comenta** un tema |
| GET · PUT · DELETE | `/api/comentarios/{id}` | Obtiene, edita o elimina un comentario (autor, MODERADOR o ADMINISTRADOR) |

Los temas y comentarios en estado `BANEADO` no se muestran.

## Datos de ejemplo

Todos los usuarios tienen la contraseña **`Cine2026!`** (guardada en Oracle como hash BCrypt).

| ID | Usuario | Rol |
|---|---|---|
| 1 | admin_cineforo | ADMINISTRADOR |
| 2 | ana_moderadora | MODERADOR |
| 3 | juan_cinefilo | USUARIO |
| 4 | maria_series | USUARIO |
| 5 | pedro_anime | USUARIO |
| 6 | camila_resenas | USUARIO |

Categorías: Estrenos, Series, Animación y Anime, Reseñas, Teorías y Spoilers.

## Cómo ejecutarlo

### 1. Base de datos (una sola vez)
1. En SQL Developer, conectado como **USUARIOS_MS**, ejecutar `scripts/01_usuarios_ms.sql` (F5).
2. Conectado como **FORO_MS**, ejecutar `scripts/02_foro_ms.sql` (F5).

### 2. Wallet y credenciales
1. Descomprimir `Wallet_foros.zip` dentro de esta carpeta, en una carpeta llamada **`wallet`**
   (debe quedar `cineforo/wallet/tnsnames.ora`, `cineforo/wallet/cwallet.sso`, etc.).
2. Copiar `db-local.properties.example` como **`db-local.properties`** y completar
   `DB_WALLET_PATH` (ruta completa a la carpeta `wallet`, con `/`) y `DB_PASSWORD`.

`wallet/` y `db-local.properties` están en `.gitignore`: **no se suben a GitHub**.

### 3. Ejecutar (primero Usuarios, después Foro)
- **VS Code** (con *Extension Pack for Java* y *Spring Boot Extension Pack*): abrir la carpeta
  `cineforo` y, en el panel **Spring Boot Dashboard**, iniciar `usuarios-ms` y luego `foro-ms`.
- **Terminal**: en `usuarios-ms` y luego en `foro-ms`, ejecutar `mvn spring-boot:run`.

### 4. Probar con Postman
Importar `postman/CineForo.postman_collection.json` y ejecutar las carpetas en orden (1 a 7).
Los POST guardan el ID creado para usarlo en los PUT y DELETE siguientes.
La carpeta 7 prueba los permisos por rol y los mensajes de error.

## Tecnologías
Java 17 · Spring Boot 3.5 (Web, Data JPA, Validation) · Spring Security Crypto (BCrypt) ·
Oracle Autonomous Database + ojdbc11 · RestClient · SLF4J · Maven · Git · Postman
