# Legacy Vault

Aplicación web de antigüedades y coleccionables con catálogo, colecciones, carrito y un flujo de compra simulado. Desarrollada con React, TypeScript y Tailwind CSS para el curso de JavaScript Avanzado.

## Funcionalidades

- Catálogo de 20 piezas con búsqueda, filtros por categoría y precio, y ordenamiento.
- Fichas de producto con fotografías, información y disponibilidad.
- Carrito con ajuste de cantidades y persistencia local en el navegador.
- Checkout con validación de datos, revisión y confirmación simulada.
- Registro, inicio de sesión y acceso como visitante. En producción se utiliza Supabase Auth con confirmación por correo.
- Formulario de contacto con validación en el navegador.
- Interfaz adaptable a dispositivos móviles, tabletas y escritorio.

El checkout no procesa pagos ni gestiona envíos reales. El formulario de contacto no envía mensajes. Las cuentas y sesiones del servidor local son para el entorno de desarrollo y no constituyen una solución de autenticación preparada para producción.

## Tecnologías

React 19, TypeScript, React Router, Tailwind CSS, Vite, JSON Server, SQLite de Node.js, Vitest y Testing Library.

## Requisitos

- Node.js `>=24.15.0 <25`.
- npm `>=11 <12`.

## Instalación y ejecución

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/juanj983009-eng/Legacy-Vault.git
cd Legacy-Vault
npm ci
```

Inicia la API en una terminal:

```bash
npm run api
```

En otra terminal, inicia la aplicación:

```bash
npm run dev
```

Abre la dirección mostrada por Vite, normalmente `http://127.0.0.1:5173`. Mantén ambas terminales abiertas: la API escucha en `http://127.0.0.1:3001` y es necesaria para cargar los productos y usar las cuentas locales. Vite redirige las solicitudes `/api` al servidor local.

Las cuentas se almacenan en `.data/accounts.sqlite`; el carrito se guarda en el almacenamiento local del navegador. Esos datos no se comparten con otros usuarios ni se suben al repositorio.

## Comandos disponibles

```bash
npm run lint          # análisis estático
npm run typecheck     # comprobación de tipos
npm test -- --run     # pruebas automatizadas
npm run build         # compilación de producción
npm run preview       # vista previa de la compilación
```

Para usar el catálogo y las cuentas durante la vista previa, inicia también `npm run api`.

## Rutas principales

| Ruta | Contenido |
| --- | --- |
| `/` | Inicio |
| `/catalogo` | Catálogo y filtros |
| `/colecciones` | Colecciones por categoría |
| `/producto/:id` | Detalle de producto |
| `/carrito` | Selección de productos |
| `/checkout` | Revisión y confirmación del pedido simulado |
| `/login` y `/registro` | Acceso y registro local |
| `/nosotros` y `/contacto` | Información y formulario de contacto |

Las rutas desconocidas muestran una página 404. Los filtros del catálogo pueden reflejarse en los parámetros de la URL.

## API y datos

Los productos se encuentran en `src/data/products.json`. En desarrollo, el cliente accede a ellos a través de:

- `GET /api/productos`: lista de productos.
- `GET /api/productos/:id`: producto por identificador.

El servicio local también ofrece las rutas `/api/auth/session`, `/api/auth/register`, `/api/auth/login` y `/api/auth/logout`. Las solicitudes de registro, acceso y cierre de sesión utilizan `POST`.

La configuración de Vercel incluye una función para consultar productos y reglas para las rutas de la aplicación. En la compilación de producción, las cuentas se gestionan mediante Supabase Auth; en desarrollo se usa el servidor local. Los registros en línea requieren confirmar el correo antes de iniciar sesión. El servicio de correo predeterminado de Supabase tiene restricciones; para admitir usuarios externos se debe configurar un proveedor SMTP propio.

## Estructura

```text
api/             Función de productos para Vercel
public/images/   Imágenes y recursos gráficos
server/          API local y servicio de cuentas
src/app/         Rutas y configuración de la aplicación
src/components/  Componentes reutilizables
src/context/     Estado compartido de productos, carrito y acceso
src/data/        Catálogo y categorías
src/hooks/       Hooks personalizados
src/pages/       Vistas y formularios
src/services/    Acceso a API y almacenamiento
src/styles/      Estilos y tokens visuales
src/types/       Tipos TypeScript
src/utils/       Validaciones y cálculos
```

## Alcance

Legacy Vault es un proyecto académico. Las imágenes son recreaciones visuales y los datos del catálogo no certifican autenticidad ni procedencia. Para convertirlo en una tienda operativa sería necesario integrar y validar servicios de cuentas, pedidos, pagos, inventario y envíos, además de reforzar la seguridad y protección de datos.
