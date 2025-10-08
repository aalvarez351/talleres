# AutoGestor - Sistema de Gestión para Talleres Mecánicos

AutoGestor es un sistema web básico de gestión para talleres mecánicos, desarrollado con el stack MERN (MongoDB, Express, React, Node.js). Proporciona una interfaz simple y funcional para gestionar clientes, vehículos, órdenes de servicio e inventario de repuestos.

## Características

- **Gestión de Clientes**: Registro y búsqueda de clientes con información de contacto.
- **Gestión de Vehículos**: Vinculación de vehículos a clientes con detalles técnicos.
- **Órdenes de Servicio**: Creación y seguimiento de órdenes con repuestos y mano de obra.
- **Inventario de Repuestos**: Control de stock y actualización automática al completar órdenes.
- **Reportes Básicos**: Estadísticas de ingresos, servicios completados y totales.
- **Autenticación**: Login básico con JWT y roles de usuario (Administrador, Mecánico, Recepción).

## Tecnologías Utilizadas

- **Frontend**: React con React Router, Axios, Bootstrap (Paper Dashboard)
- **Backend**: Node.js con Express
- **Base de Datos**: MongoDB
- **Autenticación**: JWT

## Instalación y Uso

### Prerrequisitos
- Node.js (versión 14 o superior)
- MongoDB (local o en la nube, como MongoDB Atlas)

### Instalación

1. Clona o descarga el repositorio.
2. Instala las dependencias del backend:
   ```
   cd server
   npm install
   ```
3. Instala las dependencias del frontend:
   ```
   cd ../client
   npm install
   ```

### Configuración

1. En `server/.env`, configura la URI de MongoDB y el secreto JWT.
2. Ejecuta el script de semillas para agregar datos de ejemplo:
   ```
   cd server
   node seed.js
   ```

### Ejecución

1. Inicia el servidor backend:
   ```
   cd server
   npm start
   ```
2. En otra terminal, inicia el frontend:
   ```
   cd client
   npm start
   ```
3. Abre http://localhost:3000 en tu navegador.

### Instalación y Uso

1. Clona el repositorio
2. Instala dependencias del backend: `cd server && npm install`
3. Instala dependencias del frontend: `cd client && npm install`
4. Configura las variables de entorno en `server/.env`
5. Ejecuta el seed para datos de ejemplo: `cd server && node seed.js`
6. Inicia el backend: `cd server && npm start`
7. Inicia el frontend: `cd client && npm start`
8. Accede a http://localhost:3000

## Estructura del Proyecto

```
autogestor/
├── client/          # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── server/          # Backend Node.js
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── index.js
│   ├── seed.js
│   └── package.json
└── README.md
```

### What's included

Within the download you'll find the following directories and files:

```
Paper Dashboard 2
.
├── CHANGELOG.md
├── README.md
├── assets
│   ├── css/
│   ├── demo/
│   ├── fonts/
│   ├── img/
│   ├── js
│   │   ├── core/
│   │   ├── paper-dashboard.js
│   │   ├── paper-dashboard.js.map
│   │   ├── paper-dashboard.min.js
│   │   └── plugins
│   │       ├── bootstrap-notify.js
│   │       ├── chartjs.min.js
│   │       └── perfect-scrollbar.jquery.min.js
│   └── scss/
│       ├── paper-dashboard/
│       │   ├── cards/
│       │   ├── mixins/
│       │   └── plugins/
│       └── paper-dashboard.scss
├── docs/
│   └── documentation.html
├── examples/
│   ├── dashboard.html
│   ├── icons.html
│   ├── map.html
│   ├── notifications.html
│   ├── tables.html
│   ├── typography.html
│   ├── upgrade.html
│   └── user.html
├── gulpfile.js
├── nucleo-icons.html
└── package.json
```

## Getting started
- Download the project’s zip
- Make sure you have [node.js](https://nodejs.org/en/){:rel="nofollow"} installed
- Type `npm install` in terminal/console in the source folder where `package.json` is located
- You will find all the branding colors inside `assets/scss/core/variables/_brand.scss`. You can change them with a HEX value or with other predefined variables from `assets/scss/core/variables/_colors.scss`
- Run in terminal `gulp compile-scss` for a single compilation or gulp watch for continous compilation of the changes that you make in `*.scss` files. This command should be run in the same folder where `gulpfile.js` and `package.json` are located
- Run in terminal `gulp open-app` for opening the Presentation Page (default) of the product. You can set in `gulpfile.js` from your downloaded archive any page you want to open in browser, `at line 30: gulp.src('./examples/dashboard.html')`

## Upgrade to PRO Version

Are you looking for more components? Please check our Premium Version of Paper Dashboard right [here](https://www.creative-tim.com/product/paper-dashboard-2-pro).

## Useful Links

More products from Creative Tim: <http://www.creative-tim.com/bootstrap-themes>

Tutorials: <https://www.youtube.com/channel/UCVyTG4sCw-rOvB9oHkzZD1w>

Freebies: <http://www.creative-tim.com/products>

Affiliate Program (earn money): <http://www.creative-tim.com/affiliates/new>

Social Media:

Twitter: <https://twitter.com/CreativeTim>

Facebook: <https://www.facebook.com/CreativeTim>

Dribbble: <https://dribbble.com/creativetim>

Google+: <https://plus.google.com/+CreativetimPage>

Instagram: <https://instagram.com/creativetimofficial>

[CHANGELOG]: ./CHANGELOG.md
[LICENSE]: ./LICENSE
[version-badge]: https://img.shields.io/badge/version-2.0.1-blue.svg
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
