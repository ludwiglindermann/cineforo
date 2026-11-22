-- =====================================================================
-- Ejecutar UNA VEZ conectado como ADMIN (conexion "foros_admin").
-- Crea el esquema del nuevo microservicio de moderacion.
-- Reemplaza la clave por la tuya (la de db-local.properties), entre comillas.
-- =====================================================================
CREATE USER MODERACION_MS IDENTIFIED BY "CambiaEstaClave1";
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE VIEW TO MODERACION_MS;
ALTER USER MODERACION_MS QUOTA UNLIMITED ON DATA;
