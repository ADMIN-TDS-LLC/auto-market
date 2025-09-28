# AUTOMARKET - App Android Nativa

## 🚗 Descripción
Marketplace líder de autos en Latinoamérica. Conectamos compradores y vendedores de vehículos en toda LATAM con seguridad y confianza.

## 🎯 Características Principales
- **Verificación única**: Pago de USD $2 para publicar y contactar
- **Sin chat interno**: Contacto directo vía WhatsApp/Teléfono/Email
- **Cobertura LATAM**: Desde México hasta Argentina
- **Múltiples vehículos**: Autos, motos, pickups, comerciales
- **Geolocalización**: Búsqueda por ubicación
- **Monedas locales**: Soporte para todas las monedas LATAM

## 📱 Arquitectura Técnica
- **Android Nativo**: Kotlin + Jetpack Compose
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Pagos**: RevenueCat + Google Play Billing
- **Imágenes**: Firebase Storage + Coil
- **Navegación**: Navigation Compose

## 🛠️ Estructura del Proyecto
```
app_autoMarket/
├── app/                          # Código Android principal
├── firebase_config/              # Configuración Firebase
│   ├── firestore_rules.rules    # Reglas de seguridad Firestore
│   ├── storage_rules.rules      # Reglas de seguridad Storage
│   └── initial_data.json        # Datos iniciales para testing
├── android_resources/            # Recursos para Android
│   └── brands_models_latam.json  # Catálogo de vehículos LATAM
├── Photos/                       # Imágenes del proyecto
└── docs/                        # Documentación
```

## 🔧 Setup de Desarrollo

### Prerrequisitos
- Android Studio Arctic Fox o superior
- Package name: `com.automarket.app`
- JDK 11+
- Cuenta Firebase activa
- Cuenta RevenueCat (opcional para testing)

### Configuración Firebase
1. Crear proyecto en Firebase Console: "automarket"
2. Habilitar Authentication, Firestore, Storage
3. Descargar `google-services.json` → `app/`
4. Importar reglas de seguridad desde `firebase_config/`
5. Cargar datos iniciales desde `initial_data.json`

### Configuración RevenueCat
1. Crear proyecto en RevenueCat
2. Configurar producto "verify_2usd" (One-time purchase)
3. Mapear a entitlement "verified"
4. Obtener API Key pública

### Instalación
```bash
git clone [tu-repo]
cd app_autoMarket
# Abrir en Android Studio
# Sync Gradle
# Ejecutar en emulador/dispositivo
```

## 🌎 Países Soportados
México, Guatemala, Belice, El Salvador, Honduras, Nicaragua, Costa Rica, Panamá, Colombia, Venezuela, Guyana, Surinam, Brasil, Ecuador, Perú, Bolivia, Paraguay, Uruguay, Argentina, Chile, Cuba, República Dominicana, Puerto Rico

## 💰 Modelo de Negocio
- **Verificación única**: USD $2 por usuario
- **Publicidad**: Banners cada 8 publicaciones
- **Destacados**: Publicaciones premium (futuro)

## 🚀 Roadmap
- [x] Estructura base Android
- [x] Configuración Firebase
- [x] Sistema de pagos RevenueCat
- [ ] Pantallas principales (Home, Publicar, Perfil)
- [ ] Sistema de filtros avanzados
- [ ] Geolocalización
- [ ] Testing completo
- [ ] Publicación Play Store

## 📞 Contacto
- Email: ezediez75@gmail.com
- Proyecto: AUTOMARKET LATAM

---
*Generado: Enero 2025*
