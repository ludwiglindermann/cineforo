# CineForo Web (FrontEnd en Angular)

FrontEnd de CineForo: **Angular 22 + Bootstrap 5 + Bootstrap Icons**.
Funciona por separado del BackEnd: la información se maneja con **arreglos (listas) de Angular**
dentro de servicios, respaldados en `localStorage`.

## Ejecutar

```bash
npm install
npm start          # http://localhost:4200
```

Usuarios de ejemplo (clave `Cine2026!`): `admin_cineforo` (ADMINISTRADOR), `ana_moderadora` (MODERADOR),
`juan_cinefilo`, `maria_series`, `pedro_anime`, `camila_resenas` (USUARIO).

## Páginas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Inicio: categorías, buscador y temas recientes | Todos |
| `/login` | Inicio de sesión | Invitados |
| `/registro` | Registro de usuarios | Invitados |
| `/recuperar` | Recuperar contraseña (email → código → nueva clave) | Todos |
| `/perfil` | Modificación de perfil y contraseña, mis temas | Conectados |
| `/categoria/:id` | Temas de una categoría con buscador | Todos |
| `/tema/:id` | Tema con comentarios (aviso de spoiler) | Todos (comentar: conectados) |
| `/nuevo-tema` | Publicar un tema | Conectados |
| `/moderacion` | Banear y restaurar temas o comentarios, historial | MODERADOR, ADMINISTRADOR |
| `/admin` | Roles y estado de usuarios, categorías | ADMINISTRADOR |

## Patrones de diseño

| Patrón | Dónde |
|---|---|
| **Facade** | `servicios/foro-facade.service.ts`: única puerta de entrada de las páginas; oculta almacenamiento y sesión y concentra las reglas por rol |
| **Observer** | `servicios/sesion.service.ts`: la sesión es un *signal*; barra, guards y páginas reaccionan solas al iniciar o cerrar sesión |
| **Singleton** | Servicios `providedIn: 'root'` (una sola instancia para toda la app) |

## Validaciones

- Formularios reactivos con mensajes por campo (`componentes/campo-error.ts`).
- Contraseña con **7 reglas** (`validadores/validadores.ts`): mínimo 8, máximo 20, mayúscula, minúscula,
  número, carácter especial y sin espacios; lista en vivo de requisitos.
- Confirmación de contraseña, email válido y único, nombre de usuario único y con patrón,
  edad mínima de 13 años, términos obligatorios, textos sin solo espacios, largos mínimos y máximos.

## Diseño responsivo (grilla de 12 columnas)

| Tamaño | Ancho | Ejemplo |
|---|---|---|
| Móvil | < 576 px | 1 columna, menú hamburguesa |
| Tablet | 576 – 991 px | 2 columnas |
| Escritorio | ≥ 992 px | 3 a 5 columnas, menú completo |

## Docker

```bash
docker build -t cineforo-web .
docker run -p 80:80 cineforo-web
```
