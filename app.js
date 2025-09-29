// AutoMarket Web App - Main JavaScript (Firebase CDN version)

// App State
let currentUser = null;
let vehicles = [];
let isAuthenticated = false;

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
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            isAuthenticated = !!user;
            updateUI();
            updateNavigation();
        });
        
        // Load initial data
        await loadVehicles();
        
        // Setup navigation
        setupNavigation();
        
        // Setup authentication forms
        setupAuthForms();
        
        // Hide loading screen
        setTimeout(() => {
            hideLoading();
        }, 2000);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Error al cargar la aplicación');
    }
});

// Loading Functions
function showLoading() {
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    if (mainApp) {
        mainApp.style.display = 'block';
    }
}

// Navigation Functions
function setupNavigation() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            showSection(section);
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    navBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to selected nav button
    const targetBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // Close mobile menu if open
    closeMenu();
}

// Vehicle Functions
async function loadVehicles() {
    try {
        const vehiclesQuery = db.collection('vehicles')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(20);
        
        const querySnapshot = await vehiclesQuery.get();
        vehicles = [];
        
        querySnapshot.forEach(doc => {
            vehicles.push({ id: doc.id, ...doc.data() });
        });
        
        renderVehicles();
        console.log(`Loaded ${vehicles.length} vehicles`);
        
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showError('Error al cargar vehículos');
    }
}

function renderVehicles() {
    const vehiclesList = document.getElementById('vehicles-list');
    if (!vehiclesList) return;
    
    if (vehicles.length === 0) {
        vehiclesList.innerHTML = `
            <div class="no-vehicles">
                <p>No hay vehículos disponibles en este momento.</p>
            </div>
        `;
        return;
    }
    
    vehiclesList.innerHTML = vehicles.map(vehicle => `
        <div class="vehicle-card" onclick="viewVehicle('${vehicle.id}')">
            <img src="${vehicle.imageUrl || '/512X512.jpc.jpg'}" alt="${vehicle.title}" class="vehicle-image">
            <div class="vehicle-info">
                <h3 class="vehicle-title">${vehicle.title}</h3>
                <p class="vehicle-details">${vehicle.brand} ${vehicle.model} • ${vehicle.year}</p>
                <p class="vehicle-details">${vehicle.location}</p>
                <div class="vehicle-price">$${vehicle.price.toLocaleString()} ${vehicle.currency}</div>
            </div>
        </div>
    `).join('');
}

// Authentication Functions
function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

function updateNavigation() {
    const homeBtn = document.querySelector('[data-section="home"]');
    const exploreBtn = document.querySelector('[data-section="explore"]');
    const publishBtn = document.querySelector('[data-section="publish"]');
    const profileBtn = document.querySelector('[data-section="profile"]');
    
    if (isAuthenticated) {
        // User is logged in - show all sections
        if (exploreBtn) exploreBtn.style.display = 'flex';
        if (publishBtn) publishBtn.style.display = 'flex';
        if (profileBtn) profileBtn.style.display = 'flex';
    } else {
        // User is not logged in - hide protected sections
        if (exploreBtn) exploreBtn.style.display = 'none';
        if (publishBtn) publishBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'none';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showSuccess('¡Bienvenido a AutoMarket!');
        showSection('home');
    } catch (error) {
        console.error('Login error:', error);
        showError('Error al iniciar sesión. Verificá tu email y contraseña.');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    const country = formData.get('country');
    const terms = formData.get('terms');
    
    if (!terms) {
        showError('Debés aceptar los términos y condiciones');
        return;
    }
    
    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Save user data to Firestore
        await db.collection('users').add({
            uid: user.uid,
            displayName: fullName,
            email: email,
            country: country,
            isVerifiedPayment: true, // Simulated payment
            paymentDate: new Date(),
            paymentAmount: 2,
            paymentCurrency: 'USD',
            createdAt: new Date()
        });
        
        showSuccess('¡Cuenta creada exitosamente! Pago simulado de $2 USD procesado.');
        showSection('home');
        
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'auth/email-already-in-use') {
            showError('Este email ya está registrado. Intentá iniciar sesión.');
        } else {
            showError('Error al crear la cuenta. Intentá nuevamente.');
        }
    }
}

function showLogin() {
    showSection('login');
}

function showRegister() {
    showSection('register');
}

function showTerms() {
    showSection('terms');
}

function acceptTerms() {
    // Check the terms checkbox
    const termsCheckbox = document.querySelector('input[name="terms"]');
    if (termsCheckbox) {
        termsCheckbox.checked = true;
    }
    showRegister();
}

// Mobile menu functions
function toggleMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburger = document.querySelector('.hamburger-menu');
    
    if (mobileMenu) mobileMenu.classList.toggle('active');
    if (hamburger) hamburger.classList.toggle('active');
}

function closeMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburger = document.querySelector('.hamburger-menu');
    
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
}

// UI Functions
function updateUI() {
    if (currentUser) {
        console.log('User logged in:', currentUser.email);
        renderProtectedContent();
        renderProfile();
    } else {
        console.log('User logged out');
        renderProtectedContent();
        renderProfile();
    }
}

function renderProtectedContent() {
    // Update explore section
    const exploreSection = document.getElementById('explore-section');
    if (exploreSection) {
        if (isAuthenticated) {
            // If authenticated, render the actual content
            exploreSection.innerHTML = `
                <div class="section-header">
                    <h2>Buscar Vehículos</h2>
                    <div class="filters">
                        <select id="vehicle-type" class="filter-select">
                            <option value="">Tipo de Vehículo</option>
                            <option value="auto">Autos</option>
                            <option value="moto">Motos</option>
                            <option value="pickup">Pickups</option>
                            <option value="comercial">Comerciales</option>
                        </select>
                        <select id="brand" class="filter-select">
                            <option value="">Marca</option>
                            <option value="Nissan">Nissan</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Volkswagen">Volkswagen</option>
                            <option value="Chevrolet">Chevrolet</option>
                            <option value="Ford">Ford</option>
                            <option value="Honda">Honda</option>
                            <option value="Hyundai">Hyundai</option>
                            <option value="Kia">Kia</option>
                            <option value="Mazda">Mazda</option>
                            <option value="Renault">Renault</option>
                            <option value="Peugeot">Peugeot</option>
                            <option value="Fiat">Fiat</option>
                            <option value="Jeep">Jeep</option>
                            <option value="BMW">BMW</option>
                            <option value="Mercedes-Benz">Mercedes-Benz</option>
                            <option value="Audi">Audi</option>
                        </select>
                        <select id="country" class="filter-select">
                            <option value="">País</option>
                            <option value="MX">México</option>
                            <option value="AR">Argentina</option>
                            <option value="CO">Colombia</option>
                            <option value="BR">Brasil</option>
                            <option value="CL">Chile</option>
                            <option value="PE">Perú</option>
                            <option value="UY">Uruguay</option>
                            <option value="PY">Paraguay</option>
                            <option value="BO">Bolivia</option>
                            <option value="EC">Ecuador</option>
                            <option value="VE">Venezuela</option>
                            <option value="GT">Guatemala</option>
                            <option value="HN">Honduras</option>
                            <option value="SV">El Salvador</option>
                            <option value="NI">Nicaragua</option>
                            <option value="CR">Costa Rica</option>
                            <option value="PA">Panamá</option>
                            <option value="CU">Cuba</option>
                            <option value="DO">República Dominicana</option>
                            <option value="PR">Puerto Rico</option>
                        </select>
                    </div>
                </div>
                <div id="vehicles-list" class="vehicles-list">
                    <!-- Vehicles will be loaded here -->
                </div>
            `;
        } else {
            // If not authenticated, show login prompt
            exploreSection.innerHTML = `
                <div class="auth-required">
                    <div class="auth-required-icon">🔒</div>
                    <h3>Acceso Requerido</h3>
                    <p>Necesitás iniciar sesión para buscar vehículos</p>
                    <button class="btn btn-primary" onclick="showLogin()">Iniciar Sesión</button>
                    <button class="btn btn-secondary" onclick="showRegister()">Crear Cuenta</button>
                </div>
            `;
        }
    }
    
    // Update publish section
    const publishSection = document.getElementById('publish-section');
    if (publishSection) {
        if (isAuthenticated) {
            // If authenticated, render the actual content
            publishSection.innerHTML = `
                <div class="section-header">
                    <h2>Publicar Vehículo</h2>
                    <p>Completa la información de tu vehículo</p>
                </div>
                <div id="publish-form" class="publish-form">
                    <!-- Form will be loaded here -->
                </div>
            `;
        } else {
            // If not authenticated, show login prompt
            publishSection.innerHTML = `
                <div class="auth-required">
                    <div class="auth-required-icon">📝</div>
                    <h3>Acceso Requerido</h3>
                    <p>Necesitás iniciar sesión para publicar vehículos</p>
                    <button class="btn btn-primary" onclick="showLogin()">Iniciar Sesión</button>
                    <button class="btn btn-secondary" onclick="showRegister()">Crear Cuenta</button>
                </div>
            `;
        }
    }
}

function renderProfile() {
    const profileSection = document.getElementById('profile-section');
    if (!profileSection) return;
    
    if (isAuthenticated) {
        profileSection.innerHTML = `
            <div class="profile-content">
                <div class="profile-header">
                    <div class="profile-avatar">👤</div>
                    <h2>Mi Perfil</h2>
                    <p>${currentUser.email}</p>
                </div>
                <div class="profile-info">
                    <div class="profile-item">
                        <strong>Email:</strong>
                        <span>${currentUser.email}</span>
                    </div>
                    <div class="profile-item">
                        <strong>Estado:</strong>
                        <span>Verificado</span>
                    </div>
                    <div class="profile-item">
                        <strong>Pago:</strong>
                        <span>$2 USD procesado</span>
                    </div>
                </div>
                <button class="btn btn-secondary" onclick="handleSignOut()">Cerrar Sesión</button>
            </div>
        `;
    } else {
        profileSection.innerHTML = `
            <div class="auth-required">
                <div class="auth-required-icon">👤</div>
                <h3>Acceso Requerido</h3>
                <p>Necesitás iniciar sesión para ver tu perfil</p>
                <button class="btn btn-primary" onclick="showLogin()">Iniciar Sesión</button>
                <button class="btn btn-secondary" onclick="showRegister()">Crear Cuenta</button>
            </div>
        `;
    }
}

// Utility Functions
function showSuccess(message) {
    // Simple success message
    alert('✅ ' + message);
}

function showError(message) {
    // Simple error message
    alert('❌ ' + message);
}

function handleSignOut() {
    auth.signOut().then(() => {
        showSuccess('Sesión cerrada correctamente');
        showSection('home');
    }).catch((error) => {
        console.error('Sign out error:', error);
        showError('Error al cerrar sesión');
    });
}

// Global functions for HTML onclick handlers
window.showSection = showSection;
window.viewVehicle = (vehicleId) => {
    console.log('View vehicle:', vehicleId);
    // TODO: Implement vehicle detail view
};
window.handlePublishVehicle = () => {
    console.log('Publish vehicle');
    // TODO: Implement publish vehicle
};
window.handleSignOut = handleSignOut;
window.showLoginForm = showLogin;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showTerms = showTerms;
window.acceptTerms = acceptTerms;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;