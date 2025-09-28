// AutoMarket Web App - Main JavaScript
import { auth, db, storage } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    where, 
    orderBy 
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';

// App State
let currentUser = null;
let vehicles = [];

// DOM Elements
const loadingScreen = document.getElementById('loading');
const mainApp = document.getElementById('main-app');
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading screen
        showLoading();
        
        // Initialize Firebase Auth listener
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            updateUI();
        });
        
        // Load initial data
        await loadVehicles();
        
        // Setup navigation
        setupNavigation();
        
        // Hide loading screen
        setTimeout(() => {
            hideLoading();
        }, 2000);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Error al cargar la aplicación');
    }
});

// Loading Screen Functions
function showLoading() {
    loadingScreen.style.display = 'flex';
    mainApp.style.display = 'none';
}

function hideLoading() {
    loadingScreen.style.display = 'none';
    mainApp.style.display = 'block';
}

// Navigation Functions
function setupNavigation() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            showSection(section);
            
            // Update active nav button
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section content if needed
        loadSectionContent(sectionName);
    }
}

async function loadSectionContent(sectionName) {
    switch (sectionName) {
        case 'explore':
            await renderVehicles();
            break;
        case 'publish':
            renderPublishForm();
            break;
        case 'profile':
            renderProfile();
            break;
    }
}

// Firebase Functions
async function loadVehicles() {
    try {
        const vehiclesRef = collection(db, 'vehicles');
        const q = query(vehiclesRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        vehicles = [];
        snapshot.forEach(doc => {
            vehicles.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`Loaded ${vehicles.length} vehicles`);
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showError('Error al cargar vehículos');
    }
}

async function renderVehicles() {
    const vehiclesList = document.getElementById('vehicles-list');
    if (!vehiclesList) return;
    
    if (vehicles.length === 0) {
        vehiclesList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p>No hay vehículos disponibles en este momento.</p>
            </div>
        `;
        return;
    }
    
    vehiclesList.innerHTML = vehicles.map(vehicle => `
        <div class="vehicle-card" onclick="viewVehicle('${vehicle.id}')">
            <img src="${vehicle.imageUrl || '/placeholder-car.jpg'}" 
                 alt="${vehicle.title}" 
                 class="vehicle-image"
                 onerror="this.src='/placeholder-car.jpg'">
            <div class="vehicle-info">
                <h3 class="vehicle-title">${vehicle.title}</h3>
                <div class="vehicle-price">
                    ${formatPrice(vehicle.price, vehicle.currency)}
                </div>
                <div class="vehicle-details">
                    ${vehicle.year} • ${vehicle.mileage || 'N/A'} km • ${vehicle.fuel || 'N/A'}
                </div>
                <div class="vehicle-location">
                    📍 ${vehicle.city}, ${vehicle.province}
                </div>
            </div>
        </div>
    `).join('');
}

function renderPublishForm() {
    const publishForm = document.getElementById('publish-form');
    if (!publishForm) return;
    
    publishForm.innerHTML = `
        <form id="vehicle-form" onsubmit="handlePublishVehicle(event)">
            <div class="form-group">
                <label class="form-label">Título del vehículo</label>
                <input type="text" class="form-input" name="title" required 
                       placeholder="Ej: Nissan Versa Advance 2023">
            </div>
            
            <div class="form-group">
                <label class="form-label">Tipo de vehículo</label>
                <select class="form-select" name="vehicleType" required>
                    <option value="">Seleccionar tipo</option>
                    <option value="auto">Auto</option>
                    <option value="moto">Moto</option>
                    <option value="pickup">Pickup</option>
                    <option value="comercial">Comercial</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Marca</label>
                <select class="form-select" name="brand" required>
                    <option value="">Seleccionar marca</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Ford">Ford</option>
                    <option value="Honda">Honda</option>
                    <option value="Hyundai">Hyundai</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Modelo</label>
                <input type="text" class="form-input" name="model" required 
                       placeholder="Ej: Versa">
            </div>
            
            <div class="form-group">
                <label class="form-label">Año</label>
                <input type="number" class="form-input" name="year" required 
                       min="1990" max="2025" value="2023">
            </div>
            
            <div class="form-group">
                <label class="form-label">Precio</label>
                <input type="number" class="form-input" name="price" required 
                       placeholder="280000">
            </div>
            
            <div class="form-group">
                <label class="form-label">Moneda</label>
                <select class="form-select" name="currency" required>
                    <option value="">Seleccionar moneda</option>
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                    <option value="ARS">Peso Argentino (ARS)</option>
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="BRL">Real Brasileño (BRL)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Kilometraje</label>
                <input type="number" class="form-input" name="mileage" 
                       placeholder="15000">
            </div>
            
            <div class="form-group">
                <label class="form-label">Combustible</label>
                <select class="form-select" name="fuel">
                    <option value="">Seleccionar combustible</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">País</label>
                <select class="form-select" name="countryCode" required>
                    <option value="">Seleccionar país</option>
                    <option value="MX">México</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                    <option value="BR">Brasil</option>
                    <option value="CL">Chile</option>
                    <option value="PE">Perú</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Ciudad</label>
                <input type="text" class="form-input" name="city" required 
                       placeholder="Ciudad de México">
            </div>
            
            <div class="form-group">
                <label class="form-label">Provincia/Estado</label>
                <input type="text" class="form-input" name="province" required 
                       placeholder="CDMX">
            </div>
            
            <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-textarea" name="description" 
                          placeholder="Describe las características del vehículo..."></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Imagen del vehículo</label>
                <input type="file" class="form-input" name="image" accept="image/*">
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%;">
                Publicar Vehículo
            </button>
        </form>
    `;
}

function renderProfile() {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return;
    
    if (!currentUser) {
        profileContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>Iniciar Sesión</h3>
                <p>Necesitas iniciar sesión para acceder a tu perfil</p>
                <button class="btn btn-primary" onclick="showLoginForm()">
                    Iniciar Sesión
                </button>
            </div>
        `;
        return;
    }
    
    profileContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="width: 100px; height: 100px; background: #4CAF50; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                ${currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3>${currentUser.email || 'Usuario'}</h3>
            <p>Email: ${currentUser.email}</p>
            <div style="margin-top: 2rem;">
                <button class="btn btn-secondary" onclick="handleSignOut()">
                    Cerrar Sesión
                </button>
            </div>
        </div>
    `;
}

// Event Handlers
async function handlePublishVehicle(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showError('Debes iniciar sesión para publicar un vehículo');
        return;
    }
    
    const formData = new FormData(event.target);
    const vehicleData = Object.fromEntries(formData);
    
    try {
        // Add additional fields
        vehicleData.ownerId = currentUser.uid;
        vehicleData.status = 'active';
        vehicleData.createdAt = new Date();
        vehicleData.geo = {
            _lat: 0,
            _long: 0
        };
        
        // Upload image if provided
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            const imageUrl = await uploadImage(imageFile, currentUser.uid);
            vehicleData.imageUrl = imageUrl;
        }
        
        // Save to Firestore
        await addDoc(collection(db, 'vehicles'), vehicleData);
        
        showSuccess('Vehículo publicado exitosamente');
        event.target.reset();
        
        // Reload vehicles
        await loadVehicles();
        
    } catch (error) {
        console.error('Error publishing vehicle:', error);
        showError('Error al publicar el vehículo');
    }
}

async function uploadImage(file, userId) {
    const storageRef = ref(storage, `vehicles/${userId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

function handleSignOut() {
    signOut(auth).then(() => {
        showSuccess('Sesión cerrada exitosamente');
    }).catch((error) => {
        console.error('Error signing out:', error);
        showError('Error al cerrar sesión');
    });
}

// Utility Functions
function formatPrice(price, currency) {
    const formatter = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    return formatter.format(price);
}

function updateUI() {
    // Update UI based on authentication state
    if (currentUser) {
        console.log('User logged in:', currentUser.email);
    } else {
        console.log('User logged out');
    }
}

function showError(message) {
    // Simple error display - you can enhance this with a proper notification system
    alert('Error: ' + message);
}

function showSuccess(message) {
    // Simple success display - you can enhance this with a proper notification system
    alert('Éxito: ' + message);
}

// Global functions for HTML onclick handlers
window.showSection = showSection;
window.viewVehicle = (vehicleId) => {
    console.log('View vehicle:', vehicleId);
    // TODO: Implement vehicle detail view
};
window.handlePublishVehicle = handlePublishVehicle;
window.handleSignOut = handleSignOut;
window.showLoginForm = () => {
    // TODO: Implement login form
    console.log('Show login form');
};
