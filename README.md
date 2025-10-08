# AutoGestor - Sistema de Gestión para Talleres Mecánicos

AutoGestor es un sistema web básico de gestión para talleres mecánicos, desarrollado con HTML/JavaScript (frontend) y Node.js/Express (backend). Proporciona una interfaz simple y funcional para gestionar clientes, vehículos, órdenes de servicio e inventario de repuestos.

## Características

- **Gestión de Clientes**: Registro y búsqueda de clientes con información de contacto
- **Gestión de Vehículos**: Vinculación de vehículos a clientes con detalles técnicos
- **Órdenes de Servicio**: Creación y seguimiento de órdenes con repuestos y mano de obra
- **Inventario de Repuestos**: Control de stock y gestión de inventario
- **Dashboard**: Estadísticas en tiempo real de la operación del taller
- **Interfaz Responsiva**: Basada en Paper Dashboard con Bootstrap

## Tecnologías Utilizadas

- **Frontend**: HTML5, JavaScript ES6, Bootstrap 4, Paper Dashboard
- **Backend**: Node.js con Express
- **Base de Datos**: MongoDB Atlas
- **Despliegue**: GitHub Pages (Frontend) + Render (Backend)

## Despliegue en Producción

### Backend en Render

1. Crea una cuenta en [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea un nuevo Web Service con estas configuraciones:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Root Directory**: `server`

4. Configura las variables de entorno:
   ```
   MONGODB_URI=mongodb+srv://aalvarez351:Lentesdesol@ianube.furqsl0.mongodb.net/Talleres?retryWrites=true&w=majority&appName=ianube
   JWT_SECRET=tu_jwt_secret_aqui
   NODE_ENV=production
   ```

### Frontend en GitHub Pages

1. Ve a la configuración de tu repositorio en GitHub
2. En la sección "Pages", selecciona "Deploy from a branch"
3. Selecciona la rama `main` y la carpeta `/ (root)`
4. Tu aplicación estará disponible en: `https://tu-usuario.github.io/tu-repositorio`

### Configuración de la API

Actualiza la URL de la API en `js/config.js`:
```javascript
const API_CONFIG = {
  BASE_URL: 'https://talleres-58bw.onrender.com/api'
};
```

## Desarrollo Local

### Prerrequisitos
- Node.js (versión 18 o superior)
- MongoDB Atlas (cuenta gratuita)

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/autogestor.git
   cd autogestor
   ```

2. Instala las dependencias del backend:
   ```bash
   cd server
   npm install
   ```

3. Configura las variables de entorno en `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://aalvarez351:Lentesdesol@ianube.furqsl0.mongodb.net/Talleres?retryWrites=true&w=majority&appName=ianube
   JWT_SECRET=tu_jwt_secret_local
   PORT=5000
   ```

4. Ejecuta el seed para datos de ejemplo:
   ```bash
   node seed.js
   ```

5. Inicia el servidor backend:
   ```bash
   npm start
   ```

6. Para el frontend, simplemente abre `index.html` en tu navegador o usa un servidor local:
   ```bash
   # Con Python
   python -m http.server 3000
   
   # Con Node.js
   npx http-server -p 3000
   ```

7. Accede a http://localhost:3000

## Estructura del Proyecto

```
autogestor/
├── assets/          # Recursos estáticos (CSS, JS, imágenes)
│   ├── css/
│   ├── js/
│   └── img/
├── js/              # JavaScript de la aplicación
│   ├── config.js    # Configuración de API
│   ├── dashboard.js # Funcionalidad del dashboard
│   ├── clientes.js  # Gestión de clientes
│   ├── vehiculos.js # Gestión de vehículos
│   ├── ordenes.js   # Gestión de órdenes
│   └── repuestos.js # Gestión de repuestos
├── server/          # Backend Node.js
│   ├── models/      # Modelos de MongoDB
│   ├── routes/      # Rutas de la API
│   ├── middleware/  # Middleware de autenticación
│   ├── index.js     # Servidor principal
│   ├── seed.js      # Datos de ejemplo
│   └── package.json
├── dashboard.html   # Dashboard principal
├── clientes.html    # Gestión de clientes
├── vehiculos.html   # Gestión de vehículos
├── ordenes.html     # Gestión de órdenes
├── repuestos.html   # Gestión de repuestos
├── index.html       # Página de entrada
└── README.md
```

## URLs de Producción

- **Frontend**: https://aalvarez351.github.io/talleres
- **Backend API**: https://talleres-58bw.onrender.com
- **Health Check**: https://talleres-58bw.onrender.com/health

## Funcionalidades Principales

### Dashboard
- Estadísticas en tiempo real
- Resumen de clientes, vehículos y órdenes
- Órdenes recientes
- Ingresos del día

### Gestión de Clientes
- Crear, editar y eliminar clientes
- Búsqueda por nombre o teléfono
- Información de contacto completa

### Gestión de Vehículos
- Registro de vehículos vinculados a clientes
- Información técnica (marca, modelo, año, placa)
- Búsqueda y filtrado

### Órdenes de Servicio
- Creación de órdenes con número único
- Estados: Pendiente, En progreso, Completado, Entregado
- Cálculo automático de totales
- Filtrado por estado y búsqueda

### Inventario de Repuestos
- Control de stock
- Alertas de stock bajo
- Gestión de precios y costos
- Filtrado por disponibilidad

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Soporte

Para soporte técnico o preguntas:
- Crea un issue en GitHub
- Email: aalvarez351@gmail.com

## Roadmap

- [ ] Autenticación de usuarios
- [ ] Reportes avanzados
- [ ] Notificaciones por email
- [ ] Integración con sistemas de facturación
- [ ] App móvil
- [ ] Multi-tenant (varios talleres)

---

**AutoGestor** - Simplificando la gestión de talleres mecánicos 🔧