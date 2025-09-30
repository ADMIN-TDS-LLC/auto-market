# Comandos Firebase CLI (Opcional)

## Instalar Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

## Inicializar proyecto
```bash
firebase init
# Seleccionar: Firestore, Storage, Functions (opcional)
```

## Subir reglas desde archivos
```bash
# Firestore rules
firebase deploy --only firestore:rules

# Storage rules  
firebase deploy --only storage

# Verificar reglas activas
firebase firestore:rules:get
firebase storage:rules:get
```

## Configurar Storage para galería de vehículos
```bash
# Crear estructura de carpetas en Storage
# vehicles/{vehicleId}/gallery/ (para fotos y videos)
# advertisements/{adId}/ (para banners publicitarios)
# users/{userId}/profile/ (para fotos de perfil)
# temp/{userId}/ (para archivos temporales)
```

## Importar datos iniciales (después de configurar)
```bash
# Usar Firebase Console → Firestore → Import/Export
# O usar Admin SDK con el archivo initial_data.json
```

## Verificar configuración
```bash
firebase projects:list
firebase use automarket
```









