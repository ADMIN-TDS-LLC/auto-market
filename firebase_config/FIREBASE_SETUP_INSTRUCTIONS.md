# 🔥 FIREBASE CONSOLE - CONFIGURACIÓN PASO A PASO

## 📋 INSTRUCCIONES PARA CONFIGURAR FIREBASE STORAGE

### 1. 🔐 Acceder a Firebase Console
1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto **AutoMarket**
3. En el menú lateral, haz clic en **"Storage"**

### 2. 🛡️ CONFIGURAR REGLAS DE STORAGE

#### Paso 1: Ir a "Rules"
- En Storage, haz clic en la pestaña **"Rules"**

#### Paso 2: Reemplazar las reglas actuales
Copia y pega exactamente este código:

```javascript
rules_version = '2';

// 🚗 AUTOMARKET - REGLAS DE FIREBASE STORAGE (Versión Simplificada)
service firebase.storage {
  match /b/{bucket}/o {
    
    // ==========================================
    // 🚗 GALERÍA DE VEHÍCULOS
    // ==========================================
    
    // Fotos y videos de vehículos
    match /vehicles/{vehicleId}/gallery/{fileId} {
      // Permitir lectura a todos
      allow read: if true;
      
      // Permitir escritura solo a usuarios autenticados
      allow write: if request.auth != null 
                  && request.resource.size < 50 * 1024 * 1024 // 50MB max
                  && request.resource.contentType.matches('image/.*|video/.*');
    }
    
    // ==========================================
    // 📢 SISTEMA DE PUBLICIDAD
    // ==========================================
    
    // Banners publicitarios
    match /advertisements/{adId}/{bannerFile} {
      // Permitir lectura a todos
      allow read: if true;
      
      // Permitir escritura solo a usuarios autenticados
      allow write: if request.auth != null 
                  && request.resource.size < 10 * 1024 * 1024 // 10MB max
                  && request.resource.contentType.matches('image/.*');
    }
    
    // ==========================================
    // 👤 PERFILES DE USUARIOS
    // ==========================================
    
    // Fotos de perfil
    match /users/{userId}/profile/{fileId} {
      // Permitir lectura a todos
      allow read: if true;
      
      // Permitir escritura solo al propio usuario
      allow write: if request.auth != null 
                  && request.auth.uid == userId
                  && request.resource.size < 5 * 1024 * 1024 // 5MB max
                  && request.resource.contentType.matches('image/.*');
    }
    
    // ==========================================
    // 🔧 ARCHIVOS TEMPORALES
    // ==========================================
    
    // Archivos temporales durante upload
    match /temp/{userId}/{fileId} {
      // Solo el usuario puede acceder a sus archivos temporales
      allow read, write: if request.auth != null 
                        && request.auth.uid == userId
                        && request.resource.size < 50 * 1024 * 1024; // 50MB max
    }
    
    // ==========================================
    // 🚨 REGLAS DE SEGURIDAD
    // ==========================================
    
    // Denegar acceso a cualquier otra ruta
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

#### Paso 3: Publicar las reglas
- Haz clic en **"Publish"** (Publicar)
- Espera a que se confirme la publicación

### 3. 🗄️ CONFIGURAR REGLAS DE FIRESTORE

#### Paso 1: Ir a Firestore
- En el menú lateral, haz clic en **"Firestore Database"**
- Ve a la pestaña **"Rules"**

#### Paso 2: Reemplazar las reglas actuales
Copia y pega exactamente este código:

```javascript
rules_version = '2';

// 🚗 AUTOMARKET - REGLAS DE FIRESTORE
// Configuración para vehículos, publicidad y usuarios

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ==========================================
    // 🚗 VEHÍCULOS
    // ==========================================
    
    match /vehicles/{vehicleId} {
      // Permitir lectura a todos (para marketplace público)
      allow read: if true;
      
      // Permitir escritura solo al propietario
      allow create: if request.auth != null 
                   && request.auth.uid == resource.data.sellerId;
      
      allow update: if request.auth != null 
                   && request.auth.uid == resource.data.sellerId
                   && request.resource.data.keys().hasAll(['title', 'price', 'brand', 'model', 'year', 'location']);
      
      allow delete: if request.auth != null 
                   && request.auth.uid == resource.data.sellerId;
    }
    
    // ==========================================
    // 📢 PUBLICIDAD
    // ==========================================
    
    match /advertisements/{adId} {
      // Permitir lectura a todos (para mostrar anuncios)
      allow read: if true;
      
      // Permitir escritura solo al anunciante autenticado
      allow create: if request.auth != null 
                   && request.auth.uid == request.resource.data.advertiserId
                   && request.resource.data.keys().hasAll(['companyName', 'adTitle', 'plan', 'status']);
      
      allow update: if request.auth != null 
                   && request.auth.uid == resource.data.advertiserId;
      
      allow delete: if request.auth != null 
                   && request.auth.uid == resource.data.advertiserId;
    }
    
    // ==========================================
    // 👤 USUARIOS
    // ==========================================
    
    match /users/{userId} {
      // Permitir lectura solo al propio usuario
      allow read: if request.auth != null 
                 && request.auth.uid == userId;
      
      // Permitir escritura solo al propio usuario
      allow write: if request.auth != null 
                  && request.auth.uid == userId;
    }
    
    // ==========================================
    // 💬 MENSAJES/CONTACTOS
    // ==========================================
    
    match /messages/{messageId} {
      // Permitir lectura solo a participantes del mensaje
      allow read: if request.auth != null 
                 && (request.auth.uid == resource.data.senderId 
                     || request.auth.uid == resource.data.receiverId);
      
      // Permitir escritura solo al remitente
      allow create: if request.auth != null 
                   && request.auth.uid == request.resource.data.senderId;
      
      // Permitir actualización solo para marcar como leído
      allow update: if request.auth != null 
                   && request.auth.uid == resource.data.receiverId
                   && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['readAt']);
    }
    
    // ==========================================
    // ⭐ FAVORITOS
    // ==========================================
    
    match /favorites/{favoriteId} {
      // Permitir lectura solo al usuario propietario
      allow read: if request.auth != null 
                 && request.auth.uid == resource.data.userId;
      
      // Permitir escritura solo al usuario propietario
      allow write: if request.auth != null 
                  && request.auth.uid == request.resource.data.userId;
    }
    
    // ==========================================
    // 📊 ESTADÍSTICAS (solo lectura)
    // ==========================================
    
    match /stats/{statId} {
      // Permitir lectura a todos (estadísticas públicas)
      allow read: if true;
      
      // Solo funciones de backend pueden escribir estadísticas
      allow write: if false;
    }
    
    // ==========================================
    // 🚨 CONFIGURACIÓN DE LA APP
    // ==========================================
    
    match /app-config/{configId} {
      // Permitir lectura a todos
      allow read: if true;
      
      // Solo administradores pueden modificar configuración
      allow write: if request.auth != null 
                  && request.auth.token.admin == true;
    }
    
    // ==========================================
    // 🚨 REGLAS DE SEGURIDAD
    // ==========================================
    
    // Denegar acceso a cualquier otra colección
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### Paso 3: Publicar las reglas
- Haz clic en **"Publish"** (Publicar)

### 4. ✅ VERIFICACIÓN FINAL

#### Checklist de configuración:
- [ ] ✅ Storage Rules publicadas
- [ ] ✅ Firestore Rules publicadas
- [ ] ✅ No hay errores en las reglas
- [ ] ✅ Proyecto configurado correctamente

### 5. 🧪 PROBAR FUNCIONALIDAD

#### Para probar Storage:
1. Ve a la app: https://auto-market.pro
2. Inicia sesión o regístrate
3. Ve a "Publicar Vehículo"
4. Intenta subir una foto
5. Verifica que no hay errores en la consola

#### Para probar Firestore:
1. Publica un vehículo
2. Verifica que aparece en la base de datos
3. Intenta editar/eliminar (solo si eres el propietario)

---

## 🚨 IMPORTANTE

- **No modifiques** las reglas sin entenderlas
- **Haz backup** de las reglas anteriores si las tienes
- **Prueba** cada funcionalidad después de configurar
- **Contacta** si hay algún error

¡Listo para configurar che! 🚗✨
