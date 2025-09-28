# 🔥 Guía Configuración Firebase - AUTOMARKET

## Checklist de Configuración

### ✅ Paso 1: Crear Proyecto
- [ ] Ir a https://console.firebase.google.com
- [ ] Crear proyecto "automarket"
- [ ] Activar Google Analytics (opcional)

### ✅ Paso 2: Servicios Básicos
- [ ] **Authentication**: Email/Password + Google (opcional)
- [ ] **Firestore**: Test mode, location us-central1
- [ ] **Storage**: Test mode, misma location

### ✅ Paso 3: Configurar App Android
- [ ] Project Settings → Add Android App
- [ ] Package: `com.automarket.app`
- [ ] Descargar `google-services.json`
- [ ] Colocar en: `app_autoMarket/app/google-services.json`

### ✅ Paso 4: Reglas de Seguridad
```bash
# Firestore Rules (copiar desde firebase_config/firestore_rules.rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    # Ver archivo completo en firebase_config/
  }
}
```

```bash
# Storage Rules (copiar desde firebase_config/storage_rules.rules)  
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    # Ver archivo completo en firebase_config/
  }
}
```

### ✅ Paso 5: Datos Iniciales
1. Firestore → Start collection
2. Crear colecciones: `users`, `vehicles`, `contacts`, `ads`, `appSettings`
3. Importar datos desde `firebase_config/initial_data.json`

### ✅ Paso 6: Testing
- [ ] Verificar que se crearon las colecciones
- [ ] Probar autenticación con email/password
- [ ] Subir una imagen de prueba al Storage

## 🎯 URLs Importantes
- **Firebase Console**: https://console.firebase.google.com/project/automarket
- **Firestore**: https://console.firebase.google.com/project/automarket/firestore
- **Authentication**: https://console.firebase.google.com/project/automarket/authentication
- **Storage**: https://console.firebase.google.com/project/automarket/storage

## 🚨 Errores Comunes
- **google-services.json mal ubicado**: Debe estar en `app/` no en `app/src/`
- **Package name diferente**: Usar exactamente `com.automarket.app`
- **Reglas muy restrictivas**: Empezar en test mode, luego aplicar reglas

## 📞 RevenueCat (Opcional por ahora)
- **URL**: https://app.revenuecat.com
- **Configurar después** de tener Firebase funcionando
- **Producto**: `verify_2usd` (One-time purchase)
- **Entitlement**: `verified`
