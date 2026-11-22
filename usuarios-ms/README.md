# usuarios-ms

Microservicio generado con el arquetipo **microservicio-crud-archetype**.

## Lineamientos que trae el arquetipo

- Arquitectura en capas: `controller` -> `service` -> `repository` -> `model`, con `dto` para el JSON.
- Patron **Template Method**: `comun.patron.CrudServiceBase` define el flujo CRUD comun;
  cada servicio solo implementa los pasos propios de su entidad.
- Manejo global de errores con `@RestControllerAdvice` (`comun.excepcion`).
- Conexion a Oracle Cloud con Wallet; credenciales fuera del codigo (`db-local.properties`).
- Excepciones comunes (400, 401, 403, 404, 409, 503) con respuesta JSON uniforme.
- CORS habilitado para el FrontEnd local.
- `Dockerfile` multi-stage listo para construir la imagen del microservicio.

## Como agregar una entidad

1. Crear la entidad JPA en `model`.
2. Crear su repositorio en `repository` (extiende `JpaRepository`).
3. Crear los DTO de entrada y salida en `dto`.
4. Crear el servicio en `service` extendiendo `CrudServiceBase`.
5. Crear el controlador REST en `controller`.
