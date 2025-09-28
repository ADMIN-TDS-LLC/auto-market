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





