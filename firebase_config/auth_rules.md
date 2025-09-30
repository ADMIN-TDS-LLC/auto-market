# 🔐 AUTOMARKET - CONFIGURACIÓN DE FIREBASE AUTHENTICATION

## 📋 Configuración Requerida en Firebase Console

### 1. 🔑 Métodos de Autenticación Habilitados

#### Email/Password (Principal)
- ✅ **Habilitado**: Sí
- ✅ **Verificación de email**: Opcional (para registro de vendedores)
- ✅ **Contraseñas**: Mínimo 6 caracteres

#### Métodos Adicionales (Opcionales)
- 📱 **Google Sign-In**: Para registro rápido
- 📱 **Facebook Login**: Para registro social
- 📱 **Apple Sign-In**: Para usuarios iOS

### 2. 🛡️ Configuración de Seguridad

#### Dominios Autorizados
```
https://auto-market.pro
https://auto-market.netlify.app
http://localhost:4173
http://localhost:3000
```

#### Configuración de Usuario
- ✅ **Permitir registro**: Sí
- ✅ **Eliminar usuarios**: Solo administradores
- ✅ **Cambiar email**: Solo con verificación

### 3. 📧 Plantillas de Email

#### Registro de Usuario
```
Asunto: ¡Bienvenido a AutoMarket! 🚗

Hola {{displayName}},

¡Gracias por registrarte en AutoMarket!

Tu cuenta ha sido creada exitosamente. Ahora puedes:
- Publicar vehículos
- Buscar y contactar vendedores
- Gestionar tus publicaciones

¡Bienvenido a la comunidad AutoMarket!

Equipo AutoMarket
```

#### Recuperación de Contraseña
```
Asunto: Recupera tu cuenta de AutoMarket 🔑

Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Haz clic en el siguiente enlace para crear una nueva contraseña:
{{actionLink}}

Si no solicitaste este cambio, puedes ignorar este email.

Equipo AutoMarket
```

### 4. 🔒 Reglas de Seguridad Adicionales

#### Límites de Rate Limiting
- **Registro**: 5 intentos por hora por IP
- **Login**: 10 intentos por hora por IP
- **Reset password**: 3 intentos por hora por email

#### Configuración de Tokens
- **Token expiration**: 1 hora
- **Refresh token**: 30 días
- **Custom claims**: admin, premium_user

### 5. 📱 Configuración PWA

#### Service Worker
```javascript
// En firebase-config.js
import { getMessaging, getToken } from "firebase/messaging";

// Configurar notificaciones push
const messaging = getMessaging();
getToken(messaging, { vapidKey: 'TU_VAPID_KEY' })
  .then((currentToken) => {
    if (currentToken) {
      console.log('Token de notificación:', currentToken);
    }
  });
```

#### Manifest PWA
```json
{
  "gcm_sender_id": "103953800507",
  "gcm_user_visible_only": true
}
```

### 6. 🚨 Monitoreo y Logs

#### Métricas Importantes
- Registros exitosos por día
- Intentos de login fallidos
- Usuarios activos mensuales
- Tiempo de sesión promedio

#### Alertas Configuradas
- ⚠️ Múltiples intentos de login fallidos
- ⚠️ Registros masivos desde misma IP
- ⚠️ Cambios de configuración críticos

### 7. 🔧 Configuración de Desarrollo

#### Variables de Entorno
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### Configuración de Testing
```javascript
// Para desarrollo local
if (location.hostname === 'localhost') {
  // Configuraciones específicas de desarrollo
  firebase.auth().useEmulator('http://localhost:9099');
  firebase.firestore().useEmulator('localhost', 8080);
}
```

## 📝 Checklist de Implementación

- [ ] Configurar métodos de autenticación
- [ ] Establecer dominios autorizados
- [ ] Configurar plantillas de email
- [ ] Implementar rate limiting
- [ ] Configurar notificaciones push
- [ ] Establecer monitoreo y alertas
- [ ] Configurar variables de entorno
- [ ] Probar flujo completo de autenticación

## 🚀 Próximos Pasos

1. **Implementar autenticación social** (Google, Facebook)
2. **Configurar notificaciones push** para mensajes
3. **Implementar verificación de email** para vendedores
4. **Agregar autenticación de dos factores** para cuentas premium
5. **Implementar roles de usuario** (admin, moderador, vendedor, comprador)
