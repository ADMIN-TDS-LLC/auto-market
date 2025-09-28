# AutoMarket - Marketplace de Vehículos LATAM

![AutoMarket Logo](logo.png)

## 🚗 Descripción

AutoMarket es el marketplace líder de vehículos en Latinoamérica. Conectamos compradores y vendedores de vehículos en toda LATAM con seguridad y confianza, utilizando un modelo de verificación única que garantiza transacciones seguras.

## ✨ Características Principales

- **✅ Verificación única**: Pago de USD $2 para publicar y contactar
- **📱 App Web Progresiva (PWA)**: Funciona como app nativa en móviles
- **🌎 Cobertura LATAM**: Desde México hasta Argentina
- **🚗 Múltiples vehículos**: Autos, motos, pickups, comerciales
- **📍 Geolocalización**: Búsqueda por ubicación
- **💰 Monedas locales**: Soporte para todas las monedas LATAM
- **🔥 Firebase Backend**: Autenticación, base de datos y almacenamiento
- **⚡ Offline First**: Funciona sin conexión a internet

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5/CSS3/JavaScript ES6+**: Base de la aplicación web
- **PWA (Progressive Web App)**: Service Worker, Manifest, Offline Support
- **Responsive Design**: Adaptable a todos los dispositivos
- **Firebase SDK**: Integración completa con servicios de Google

### Backend
- **Firebase Authentication**: Login seguro con email/password
- **Cloud Firestore**: Base de datos NoSQL en tiempo real
- **Firebase Storage**: Almacenamiento de imágenes
- **Firebase Hosting**: Deploy automático

### Desarrollo
- **Vite**: Build tool moderno y rápido
- **GitHub**: Control de versiones
- **Netlify**: Deploy continuo y dominio personalizado

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta Firebase
- Cuenta Netlify

### Configuración Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/ADMIN-TDS-LLC/auto-market.git
cd auto-market
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilitar Authentication, Firestore, Storage
   - Copiar configuración a `firebase-config.js`

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Build para producción**
```bash
npm run build
```

## 🌐 Deploy

### Netlify (Recomendado)
1. Conectar repositorio GitHub a Netlify
2. Configurar build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Configurar variables de entorno si es necesario
4. Deploy automático en cada push

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📱 PWA Features

- **Instalable**: Se puede instalar en dispositivos móviles
- **Offline**: Funciona sin conexión a internet
- **Push Notifications**: Notificaciones de nuevos vehículos
- **App-like**: Experiencia similar a app nativa
- **Fast Loading**: Carga rápida con cache inteligente

## 🔧 Configuración Firebase

### Estructura de Base de Datos
```
firestore/
├── users/           # Usuarios registrados
├── vehicles/        # Vehículos publicados
├── contacts/        # Información de contacto
├── favorites/       # Favoritos de usuarios
├── reports/         # Reportes de usuarios
└── appSettings/     # Configuración de la app
```

### Reglas de Seguridad
- Lectura pública de vehículos activos
- Solo usuarios verificados pueden publicar
- Contactos solo para usuarios verificados
- Modo test para desarrollo

## 🌎 Países Soportados

México, Guatemala, Belice, El Salvador, Honduras, Nicaragua, Costa Rica, Panamá, Colombia, Venezuela, Guyana, Surinam, Brasil, Ecuador, Perú, Bolivia, Paraguay, Uruguay, Argentina, Chile, Cuba, República Dominicana, Puerto Rico

## 💰 Modelo de Negocio

- **Verificación única**: USD $2 por usuario (futuro: RevenueCat)
- **Publicidad**: Banners cada 8 publicaciones (futuro)
- **Destacados**: Publicaciones premium (futuro)

## 📊 Roadmap

- [x] ✅ Estructura base web con PWA
- [x] ✅ Configuración Firebase completa
- [x] ✅ Sistema de autenticación
- [x] ✅ Publicación de vehículos
- [x] ✅ Búsqueda y filtros
- [ ] 🔄 Sistema de pagos (RevenueCat)
- [ ] 📱 Optimización móvil
- [ ] 🔔 Notificaciones push
- [ ] 📈 Analytics y métricas
- [ ] 🏪 Play Store / App Store

## 🔗 URLs Importantes

- **App Web**: https://auto-market.pro
- **GitHub**: https://github.com/ADMIN-TDS-LLC/auto-market
- **Firebase Console**: https://console.firebase.google.com/project/automarket-pro
- **Netlify**: https://app.netlify.com/teams/admin-9dr7-mc/projects

## 📞 Contacto

- **Empresa**: Ten Digital Services LLC
- **Email**: admin@tendigitalservicesllc.com
- **Proyecto**: AutoMarket LATAM
- **Desarrollado**: Enero 2025

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

*AutoMarket - Conectando LATAM, un vehículo a la vez* 🚗✨
