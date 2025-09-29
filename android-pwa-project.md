# AutoMarket PWA - Configuración Android Studio

## 📱 Configuración para Android Studio

### **Nombre del Proyecto:** `AutoMarket-PWA`
### **Ubicación:** `C:\app_autoMarket\android-pwa`

## 🛠️ Pasos para crear en Android Studio:

1. **Abrir Android Studio**
2. **File** → **New** → **Project**
3. **Seleccionar:** `Web` → `Static Web`
4. **Configuración:**
   - **Project name:** `AutoMarket-PWA`
   - **Location:** `C:\app_autoMarket\android-pwa`
   - **Template:** `Basic`

## 📁 Estructura del proyecto:

```
android-pwa/
├── src/
│   └── main/
│       ├── webapp/
│       │   ├── index.html
│       │   ├── styles.css
│       │   ├── app.js
│       │   ├── sw.js
│       │   └── manifest.json
│       └── resources/
│           └── static/
│               ├── images/
│               └── icons/
├── build.gradle
└── settings.gradle
```

## 🎯 Características PWA:

- ✅ Service Worker optimizado
- ✅ Manifest.json configurado
- ✅ Iconos PWA (512x512)
- ✅ Responsive design
- ✅ Offline capability
- ✅ Installable en Chrome

## 🔧 Build configuration:

- **Target:** Web browsers
- **Framework:** Vanilla JS + Vite
- **Deploy:** Netlify + GitHub
- **Domain:** auto-market.pro
