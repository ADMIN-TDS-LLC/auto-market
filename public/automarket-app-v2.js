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
        loadMarketplaceFeed();
        
        // Setup navigation
        setupNavigation();
        
        // Setup authentication forms
        setupAuthForms();
        
        // PWA install prompt DESACTIVADO (Service Worker bloqueaba actualizaciones)
        // setupPWAInstallPrompt();
        
        // Setup gallery and publish form
        setupGallery();
        setupPublishForm();
        
        // Setup advertising system
        setupAdvertisingForms();
        
        // Cache management DESACTIVADO (Service Worker bloqueaba actualizaciones)
        // clearCacheIfNeeded();
        
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
            showError('Este email ya está registrado. ¿Querés iniciar sesión?');
            // Auto-redirect to login after 2 seconds
            setTimeout(() => {
                showSection('login');
                // Pre-fill the email field
                const emailInput = document.querySelector('#login-section input[name="email"]');
                if (emailInput) emailInput.value = email;
            }, 2000);
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

// Marketplace Feed Functions
function toggleFilters() {
    const filters = document.getElementById('advanced-filters');
    if (filters.style.display === 'none') {
        filters.style.display = 'block';
    } else {
        filters.style.display = 'none';
    }
}

function showVehicleDetail(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const detailContent = document.getElementById('vehicle-detail-content');
    detailContent.innerHTML = `
        <div class="vehicle-gallery">
            <img src="${vehicle.imageUrl || '/512X512.jpc.jpg'}" alt="${vehicle.title}" class="main-image">
        </div>
        
        <div class="vehicle-info-detail">
            <h3>${vehicle.title}</h3>
            <div class="vehicle-price-large">$${vehicle.price.toLocaleString()} ${vehicle.currency}</div>
            
            <div class="vehicle-specs">
                <div class="spec-item">
                    <strong>Marca:</strong> ${vehicle.brand}
                </div>
                <div class="spec-item">
                    <strong>Modelo:</strong> ${vehicle.model}
                </div>
                <div class="spec-item">
                    <strong>Año:</strong> ${vehicle.year}
                </div>
                <div class="spec-item">
                    <strong>Kilometraje:</strong> ${vehicle.mileage || 'No especificado'} km
                </div>
                <div class="spec-item">
                    <strong>Ubicación:</strong> ${vehicle.location}
                </div>
            </div>
            
            <div class="vehicle-description">
                <h4>Descripción</h4>
                <p>${vehicle.description || 'Sin descripción disponible.'}</p>
            </div>
        </div>
        
        <div class="contact-seller">
            <h4>Contactar al Vendedor</h4>
            <div class="contact-info">
                <div class="contact-item">
                    <span>📧</span>
                    <span>${vehicle.sellerEmail || 'vendedor@automarket.com'}</span>
                </div>
                <div class="contact-item">
                    <span>📞</span>
                    <span>${vehicle.sellerPhone || '+54 9 11 1234-5678'}</span>
                </div>
            </div>
            <button class="contact-btn" onclick="contactSeller('${vehicleId}')">
                💬 Contactar Vendedor
            </button>
        </div>
    `;
    
    showSection('vehicle-detail');
}

function contactSeller(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Simulate contact action
    alert(`Contactando al vendedor de ${vehicle.title}...`);
}

function loadMarketplaceFeed() {
    const feed = document.getElementById('marketplace-feed');
    if (!feed) return;
    
    // Sample vehicles data with demos
    const sampleVehicles = [
        {
            id: '1',
            title: 'VW Polo Comfortline 2019',
            brand: 'Volkswagen',
            model: 'Polo',
            year: 2019,
            price: 15500,
            currency: 'USD',
            mileage: 145000,
            location: 'Pilar, BA',
            distance: '7 km',
            imageUrl: '/512X512.jpc.jpg',
            badge: 'Recién publicado',
            badgeType: 'new',
            paymentMethod: 'both',
            description: 'Excelente estado, único dueño.'
        },
        {
            id: '2',
            title: 'VW Gol Trend 2018',
            brand: 'Volkswagen',
            model: 'Gol',
            year: 2018,
            price: 12500,
            currency: 'USD',
            mileage: 120000,
            location: 'Tigre, BA',
            distance: '15 km',
            imageUrl: '/512X512.jpc.jpg',
            badge: 'Actualizado',
            badgeType: 'updated',
            paymentMethod: 'cash',
            description: 'Buen estado general.'
        },
        {
            id: '3',
            title: 'Honda Civic EX 2020',
            brand: 'Honda',
            model: 'Civic',
            year: 2020,
            price: 25000,
            currency: 'USD',
            mileage: 45000,
            location: 'San Isidro, BA',
            distance: '12 km',
            imageUrl: '/512X512.jpc.jpg',
            badge: 'Nuevo',
            badgeType: 'new',
            paymentMethod: 'financing',
            description: 'Impecable, como nuevo.'
        },
        {
            id: '4',
            title: 'Yamaha R3 2021',
            brand: 'Yamaha',
            model: 'YZF-R3',
            year: 2021,
            price: 8500,
            currency: 'USD',
            mileage: 12000,
            location: 'CABA',
            distance: '5 km',
            imageUrl: '/512X512.jpc.jpg',
            badge: 'Nuevo',
            badgeType: 'new',
            paymentMethod: 'both',
            description: 'Moto deportiva, excelente estado.'
        },
        {
            id: '5',
            title: 'Lancha Quicksilver 2022',
            brand: 'Quicksilver',
            model: 'Activ 505',
            year: 2022,
            price: 45000,
            currency: 'USD',
            mileage: 120,
            location: 'Tigre, BA',
            distance: '18 km',
            imageUrl: '/512X512.jpc.jpg',
            badge: 'Nuevo',
            badgeType: 'new',
            paymentMethod: 'financing',
            description: 'Lancha seminueva, motor Mercury.'
        },
        {
            id: '6',
            title: 'Toyota Corolla XEI 2017',
            brand: 'Toyota',
            model: 'Corolla',
            year: 2017,
            price: 18000,
            currency: 'USD',
            mileage: 85000,
            location: 'Vicente López, BA',
            distance: '8 km',
            imageUrl: '/512X512.jpc.jpg',
            badge: 'Nuevo',
            badgeType: 'new',
            paymentMethod: 'both',
            description: 'Confiabilidad Toyota, servicio oficial.'
        }
    ];
    
    // Sample ads data
    const sampleAds = [
        {
            id: 'ad-1',
            company: 'REPUESTOS TITO',
            description: '¡Descuentos especiales en repuestos!',
            icon: '🔧'
        },
        {
            id: 'ad-2',
            company: 'CEITERA GUSTAVO LÓPEZ',
            description: 'Cerrajería automotriz 24/7',
            icon: '🔑'
        }
    ];
    
    let feedHTML = '';
    sampleVehicles.forEach((vehicle, index) => {
        feedHTML += `
            <div class="vehicle-card" onclick="showVehicleDetail('${vehicle.id}')">
                <img src="${vehicle.imageUrl}" alt="${vehicle.title}" class="vehicle-image">
                <div class="vehicle-badge ${vehicle.badgeType}">${vehicle.badge}</div>
                <div class="vehicle-actions" onclick="event.stopPropagation()">
                    <button class="action-btn edit-btn" onclick="editPublication('${vehicle.id}')" title="Editar publicación">
                        ✏️
                    </button>
                    <button class="action-btn pause-btn" onclick="pausePublication('${vehicle.id}')" title="Pausar publicación">
                        ⏸️
                    </button>
                    <button class="action-btn delete-btn" onclick="confirmDeletePublication('${vehicle.id}')" title="Eliminar publicación">
                        🗑️
                    </button>
                </div>
                <div class="vehicle-info">
                    <div class="vehicle-price">$${vehicle.price.toLocaleString()}</div>
                    <div class="vehicle-details">${vehicle.title} ${vehicle.mileage.toLocaleString()}km</div>
                    <div class="vehicle-location">
                        <span>📍</span>
                        <span>${vehicle.location} ${vehicle.distance}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add ads every 2 vehicles
        if ((index + 1) % 2 === 0 && index < sampleVehicles.length - 1) {
            const adIndex = Math.floor((index + 1) / 2) - 1;
            const ad = sampleAds[adIndex % sampleAds.length];
            feedHTML += `
                <div class="ad-card" onclick="showAdDetail('${ad.id}')">
                    <div class="ad-content">
                        <div class="ad-badge">PUBLICIDAD</div>
                        <div class="ad-image">${ad.icon}</div>
                        <div class="ad-text">
                            <strong>${ad.company}</strong>
                            <p>${ad.description}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    feed.innerHTML = feedHTML;
}

// Gallery Functions
let selectedFiles = [];
const maxPhotos = 10;
const maxVideos = 2;

function openGallery() {
    const input = document.getElementById('gallery-input');
    if (input) {
        input.click();
    }
}

async function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    
    // Filter files by type and validate limits
    let newPhotos = files.filter(file => file.type.startsWith('image/'));
    let newVideos = files.filter(file => file.type.startsWith('video/'));
    
    // Check current counts
    const currentPhotos = selectedFiles.filter(file => file.type.startsWith('image/')).length;
    const currentVideos = selectedFiles.filter(file => file.type.startsWith('video/')).length;
    
    // Limit photos
    if (currentPhotos + newPhotos.length > maxPhotos) {
        newPhotos = newPhotos.slice(0, maxPhotos - currentPhotos);
        showError(`Solo puedes seleccionar hasta ${maxPhotos} fotos`);
    }
    
    // Limit videos
    if (currentVideos + newVideos.length > maxVideos) {
        newVideos = newVideos.slice(0, maxVideos - currentVideos);
        showError(`Solo puedes seleccionar hasta ${maxVideos} videos`);
    }
    
    // Validate video size
    const maxVideoSize = 50 * 1024 * 1024; // 50MB max
    const validVideos = [];
    
    for (const video of newVideos) {
        // Check file size
        if (video.size > maxVideoSize) {
            showError(`El video "${video.name}" es demasiado grande. Máximo 50MB.`);
            continue;
        }
        
        // Add to valid videos (duration validation happens in background)
        validVideos.push(video);
        
        // Validate duration in background (non-blocking)
        validateVideoDuration(video).then(isValid => {
            if (!isValid) {
                showError(`El video "${video.name}" es muy largo. Máximo 1 minuto.`);
                // Remove from selection if too long
                const index = selectedFiles.indexOf(video);
                if (index > -1) {
                    selectedFiles.splice(index, 1);
                    updateGalleryPreview();
                    updateGalleryCounts();
                }
            }
        }).catch(error => {
            console.warn('Could not validate video duration:', error);
        });
    }
    
    // Use validated videos
    newVideos = validVideos;
    
    // Add new files to selection
    selectedFiles.push(...newPhotos, ...newVideos);
    
    // Update preview
    updateGalleryPreview();
    updateGalleryCounts();
    
    // Show file information
    showFileInfo(newPhotos, newVideos);
    
    // Clear input
    event.target.value = '';
}

function updateGalleryPreview() {
    const preview = document.getElementById('gallery-preview');
    if (!preview) return;
    
    preview.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        if (file.type.startsWith('image/')) {
            item.innerHTML = `
                <img src="${URL.createObjectURL(file)}" alt="Preview ${index + 1}">
                <div class="gallery-item-type">📸</div>
                <div class="gallery-item-overlay">
                    <button class="gallery-item-remove" onclick="removeGalleryItem(${index})">🗑️ Eliminar</button>
                </div>
            `;
        } else if (file.type.startsWith('video/')) {
            const videoUrl = URL.createObjectURL(file);
            item.innerHTML = `
                <video src="${videoUrl}" muted preload="metadata" playsinline>
                    <source src="${videoUrl}" type="${file.type}">
                    Tu navegador no soporta videos HTML5.
                </video>
                <div class="gallery-item-type">🎥</div>
                <div class="video-info">
                    <span class="video-duration">⏱️ ${Math.round(file.size / 1024 / 1024 * 10) / 10}MB</span>
                </div>
                <div class="gallery-item-overlay">
                    <button class="gallery-item-remove" onclick="removeGalleryItem(${index})">🗑️ Eliminar</button>
                </div>
            `;
        }
        
        preview.appendChild(item);
    });
}

function removeGalleryItem(index) {
    selectedFiles.splice(index, 1);
    updateGalleryPreview();
    updateGalleryCounts();
}

function updateGalleryCounts() {
    const photoCount = selectedFiles.filter(file => file.type.startsWith('image/')).length;
    const videoCount = selectedFiles.filter(file => file.type.startsWith('video/')).length;
    
    const photoCountElement = document.getElementById('photo-count');
    const videoCountElement = document.getElementById('video-count');
    
    if (photoCountElement) photoCountElement.textContent = photoCount;
    if (videoCountElement) videoCountElement.textContent = videoCount;
}

function validateVideoDuration(videoFile) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            // Clean up
            URL.revokeObjectURL(video.src);
            
            // Check if duration is valid (max 60 seconds)
            const isValid = video.duration <= 60;
            resolve(isValid);
        };
        
        video.onerror = () => {
            // If we can't load metadata, assume it's valid
            URL.revokeObjectURL(video.src);
            resolve(true);
        };
        
        // Set source and load metadata
        video.src = URL.createObjectURL(videoFile);
    });
}

function showFileInfo(photos, videos) {
    if (photos.length > 0 || videos.length > 0) {
        let message = 'Archivos agregados:\n';
        
        photos.forEach(photo => {
            const sizeMB = Math.round(photo.size / 1024 / 1024 * 100) / 100;
            message += `📸 ${photo.name} (${sizeMB}MB)\n`;
        });
        
        videos.forEach(video => {
            const sizeMB = Math.round(video.size / 1024 / 1024 * 100) / 100;
            message += `🎥 ${video.name} (${sizeMB}MB)\n`;
        });
        
        // Show success message
        showSuccess(`${photos.length} foto(s) y ${videos.length} video(s) agregados correctamente`);
    }
}

function setupGallery() {
    const input = document.getElementById('gallery-input');
    if (input) {
        input.addEventListener('change', handleFileSelection);
    }
}

function setupPublishForm() {
    const form = document.getElementById('publish-vehicle-form');
    if (form) {
        form.addEventListener('submit', handlePublishVehicle);
    }
}

// Form submission handler
async function handlePublishVehicle(event) {
    event.preventDefault();
    
    if (!isAuthenticated) {
        showError('Debes iniciar sesión para publicar vehículos');
        showSection('login');
        return;
    }
    
    if (selectedFiles.length === 0) {
        showError('Debes seleccionar al menos una foto del vehículo');
        return;
    }
    
    const formData = new FormData(event.target);
    const vehicleData = {
        title: formData.get('title'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        year: parseInt(formData.get('year')),
        mileage: parseInt(formData.get('mileage')),
        price: parseFloat(formData.get('price')),
        currency: formData.get('currency'),
        location: formData.get('location'),
        description: formData.get('description'),
        sellerId: currentUser.uid,
        sellerEmail: currentUser.email,
        sellerPhone: '+54 9 11 1234-5678', // TODO: Get from user profile
        createdAt: new Date(),
        status: 'active'
    };
    
    // Upload to Firebase Storage and Firestore
    try {
        const vehicleId = await publishVehicleWithStorage(vehicleData, selectedFiles);
        console.log('Vehicle published with ID:', vehicleId);
        
        showSuccess('¡Vehículo publicado exitosamente!');
        showSection('explore');
        
        // Reset form
        document.getElementById('publish-vehicle-form').reset();
        selectedFiles = [];
        updateGalleryPreview();
        updateGalleryCounts();
        
        // Reload marketplace feed
        loadMarketplaceFeed();
    } catch (error) {
        console.error('Error publishing vehicle:', error);
        showError('Error al publicar el vehículo. Intenta nuevamente.');
    }
}

// Publication Management Functions
function editPublication(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Show edit modal
    showEditModal(vehicleId, vehicle);
}

function showEditModal(vehicleId, vehicle) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content edit-modal">
            <div class="modal-header">
                <h3>✏️ Editar Publicación</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p><strong>Editando:</strong> "${vehicle.title}"</p>
                
                <form id="edit-vehicle-form" class="edit-form">
                    <div class="form-group">
                        <label class="form-label">Título de la Publicación</label>
                        <input type="text" class="form-input" name="title" value="${vehicle.title}" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Precio</label>
                            <input type="number" class="form-input" name="price" value="${vehicle.price}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Moneda</label>
                            <select class="form-select" name="currency" required>
                                <option value="USD" ${vehicle.currency === 'USD' ? 'selected' : ''}>🇺🇸 USD (Dólar Americano)</option>
                                <option value="USDC" ${vehicle.currency === 'USDC' ? 'selected' : ''}>💎 USDC (USD Coin)</option>
                                <option value="USDT" ${vehicle.currency === 'USDT' ? 'selected' : ''}>💎 USDT (Tether)</option>
                                <option value="ARS" ${vehicle.currency === 'ARS' ? 'selected' : ''}>🇦🇷 ARS (Peso Argentino)</option>
                                <option value="MXN" ${vehicle.currency === 'MXN' ? 'selected' : ''}>🇲🇽 MXN (Peso Mexicano)</option>
                                <option value="COP" ${vehicle.currency === 'COP' ? 'selected' : ''}>🇨🇴 COP (Peso Colombiano)</option>
                                <option value="BRL" ${vehicle.currency === 'BRL' ? 'selected' : ''}>🇧🇷 BRL (Real Brasileño)</option>
                                <option value="CLP" ${vehicle.currency === 'CLP' ? 'selected' : ''}>🇨🇱 CLP (Peso Chileno)</option>
                                <option value="PEN" ${vehicle.currency === 'PEN' ? 'selected' : ''}>🇵🇪 PEN (Sol Peruano)</option>
                                <option value="UYU" ${vehicle.currency === 'UYU' ? 'selected' : ''}>🇺🇾 UYU (Peso Uruguayo)</option>
                                <option value="PYG" ${vehicle.currency === 'PYG' ? 'selected' : ''}>🇵🇾 PYG (Guaraní Paraguayo)</option>
                                <option value="BOB" ${vehicle.currency === 'BOB' ? 'selected' : ''}>🇧🇴 BOB (Boliviano)</option>
                                <option value="VES" ${vehicle.currency === 'VES' ? 'selected' : ''}>🇻🇪 VES (Bolívar Venezolano)</option>
                                <option value="GTQ" ${vehicle.currency === 'GTQ' ? 'selected' : ''}>🇬🇹 GTQ (Quetzal Guatemalteco)</option>
                                <option value="HNL" ${vehicle.currency === 'HNL' ? 'selected' : ''}>🇭🇳 HNL (Lempira Hondureño)</option>
                                <option value="SVC" ${vehicle.currency === 'SVC' ? 'selected' : ''}>🇸🇻 SVC (Colón Salvadoreño)</option>
                                <option value="NIO" ${vehicle.currency === 'NIO' ? 'selected' : ''}>🇳🇮 NIO (Córdoba Nicaragüense)</option>
                                <option value="CRC" ${vehicle.currency === 'CRC' ? 'selected' : ''}>🇨🇷 CRC (Colón Costarricense)</option>
                                <option value="PAB" ${vehicle.currency === 'PAB' ? 'selected' : ''}>🇵🇦 PAB (Balboa Panameño)</option>
                                <option value="CUP" ${vehicle.currency === 'CUP' ? 'selected' : ''}>🇨🇺 CUP (Peso Cubano)</option>
                                <option value="DOP" ${vehicle.currency === 'DOP' ? 'selected' : ''}>🇩🇴 DOP (Peso Dominicano)</option>
                                <option value="HTG" ${vehicle.currency === 'HTG' ? 'selected' : ''}>🇭🇹 HTG (Gourde Haitiano)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Ubicación</label>
                        <input type="text" class="form-input" name="location" value="${vehicle.location}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Kilometraje</label>
                        <input type="number" class="form-input" name="mileage" value="${vehicle.mileage}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Descripción</label>
                        <textarea class="form-textarea" name="description" rows="4" placeholder="Describe el estado del vehículo...">${vehicle.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Modalidad de Pago</label>
                        <select class="form-select" name="paymentMethod">
                            <option value="cash" ${vehicle.paymentMethod === 'cash' ? 'selected' : ''}>💵 Efectivo</option>
                            <option value="transfer" ${vehicle.paymentMethod === 'transfer' ? 'selected' : ''}>🏦 Transferencia</option>
                            <option value="financing" ${vehicle.paymentMethod === 'financing' ? 'selected' : ''}>🏧 Financiación</option>
                            <option value="both" ${vehicle.paymentMethod === 'both' ? 'selected' : ''}>💰 Efectivo o Financiación</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeModal(this)">Cancelar</button>
                <button class="btn btn-primary" onclick="savePublicationChanges('${vehicleId}')">💾 Guardar Cambios</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function savePublicationChanges(vehicleId) {
    const form = document.getElementById('edit-vehicle-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (!vehicle) return;
    
    // Update vehicle data
    vehicle.title = formData.get('title');
    vehicle.price = parseFloat(formData.get('price'));
    vehicle.currency = formData.get('currency');
    vehicle.location = formData.get('location');
    vehicle.mileage = parseInt(formData.get('mileage'));
    vehicle.description = formData.get('description');
    vehicle.paymentMethod = formData.get('paymentMethod');
    vehicle.updatedAt = new Date();
    vehicle.badge = 'Recién actualizado';
    vehicle.badgeType = 'updated';
    
    // Close modal
    const modal = document.querySelector('.modal-overlay');
    closeModal(modal.querySelector('.modal-close'));
    
    // Show success message
    showSuccess('Publicación actualizada exitosamente');
    
    // Reload feed
    loadMarketplaceFeed();
    
    console.log('Publication updated:', vehicleId, vehicle);
}

function pausePublication(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Show confirmation modal
    showConfirmationModal(
        'Pausar Publicación',
        `¿Estás seguro de que querés pausar la publicación de "${vehicle.title}"?`,
        'Pausar',
        'Cancelar',
        () => {
            // Update vehicle status
            vehicle.status = 'paused';
            vehicle.pausedAt = new Date();
            
            // Show success message
            showSuccess('Publicación pausada exitosamente');
            
            // Reload feed
            loadMarketplaceFeed();
            
            console.log('Publication paused:', vehicleId);
        }
    );
}

function confirmDeletePublication(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Show deletion modal with reason selection
    showDeleteModal(vehicleId, vehicle.title);
}

function showDeleteModal(vehicleId, vehicleTitle) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content delete-modal">
            <div class="modal-header">
                <h3>🗑️ Eliminar Publicación</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p><strong>¿Estás seguro de que querés eliminar esta publicación?</strong></p>
                <p class="vehicle-title">"${vehicleTitle}"</p>
                
                <div class="delete-reasons">
                    <h4>Motivo de eliminación:</h4>
                    <div class="reason-options">
                        <label class="reason-option">
                            <input type="radio" name="deleteReason" value="sold">
                            <span>✅ Vehículo vendido</span>
                        </label>
                        <label class="reason-option">
                            <input type="radio" name="deleteReason" value="changed_mind">
                            <span>🤔 Me arrepentí de vender</span>
                        </label>
                        <label class="reason-option">
                            <input type="radio" name="deleteReason" value="price_change">
                            <span>💰 Voy a cambiar el precio (editaré la publicación)</span>
                        </label>
                        <label class="reason-option">
                            <input type="radio" name="deleteReason" value="other">
                            <span>📝 Otro motivo</span>
                        </label>
                    </div>
                    
                    <div class="custom-reason" style="display: none;">
                        <textarea placeholder="Explica tu motivo..." maxlength="200"></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeModal(this)">Cancelar</button>
                <button class="btn btn-danger" onclick="deletePublication('${vehicleId}')">Eliminar Publicación</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle reason selection
    const reasonInputs = modal.querySelectorAll('input[name="deleteReason"]');
    const customReason = modal.querySelector('.custom-reason');
    
    reasonInputs.forEach(input => {
        input.addEventListener('change', () => {
            customReason.style.display = input.value === 'other' ? 'block' : 'none';
        });
    });
}

function deletePublication(vehicleId) {
    const modal = document.querySelector('.modal-overlay');
    const selectedReason = modal.querySelector('input[name="deleteReason"]:checked');
    const customReason = modal.querySelector('.custom-reason textarea');
    
    if (!selectedReason) {
        showError('Por favor selecciona un motivo para eliminar la publicación');
        return;
    }
    
    const reason = selectedReason.value;
    const reasonText = reason === 'other' ? customReason.value : selectedReason.nextElementSibling.textContent;
    
    // Remove from vehicles array
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    if (vehicleIndex > -1) {
        vehicles.splice(vehicleIndex, 1);
    }
    
    // Close modal
    closeModal(modal.querySelector('.modal-close'));
    
    // Show success message
    showSuccess('Publicación eliminada exitosamente');
    
    // Reload feed
    loadMarketplaceFeed();
    
    console.log('Publication deleted:', vehicleId, 'Reason:', reasonText);
}

function showConfirmationModal(title, message, confirmText, cancelText, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeModal(this)">${cancelText}</button>
                <button class="btn btn-primary" onclick="confirmAction()">${confirmText}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store confirm action
    modal.confirmAction = onConfirm;
    
    // Make confirmAction available globally for this modal
    window.confirmAction = () => {
        onConfirm();
        closeModal(modal.querySelector('.modal-close'));
        window.confirmAction = null; // Clean up
    };
}

function closeModal(closeButton) {
    const modal = closeButton.closest('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Global functions for HTML onclick handlers
window.showSection = showSection;
window.viewVehicle = showVehicleDetail;
window.toggleFilters = toggleFilters;
window.openGallery = openGallery;
window.removeGalleryItem = removeGalleryItem;
window.handlePublishVehicle = handlePublishVehicle;
window.editPublication = editPublication;
window.savePublicationChanges = savePublicationChanges;
window.pausePublication = pausePublication;
window.confirmDeletePublication = confirmDeletePublication;
window.deletePublication = deletePublication;
window.closeModal = closeModal;

// Advertising System Functions
function showAdvertiserLogin() {
    document.getElementById('advertiser-login').style.display = 'flex';
    document.getElementById('ad-creation-form').style.display = 'none';
}

function showAdCreationForm() {
    document.getElementById('advertiser-login').style.display = 'none';
    document.getElementById('ad-creation-form').style.display = 'block';
}

function openBannerUpload() {
    const input = document.getElementById('banner-input');
    if (input) {
        input.click();
    }
}

function selectPlan(planType) {
    const radio = document.getElementById(`plan-${planType}`);
    if (radio) {
        radio.checked = true;
    }
}

function handleAdvertiserLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const advertiserData = {
        email: formData.get('email'),
        phone: formData.get('phone'),
        loginTime: new Date()
    };
    
    // Store advertiser data
    localStorage.setItem('advertiserData', JSON.stringify(advertiserData));
    
    // Show creation form
    showAdCreationForm();
    
    // Pre-fill contact fields
    const contactEmail = document.querySelector('input[name="contactEmail"]');
    const contactPhone = document.querySelector('input[name="contactPhone"]');
    
    if (contactEmail) contactEmail.value = advertiserData.email;
    if (contactPhone) contactPhone.value = advertiserData.phone;
    
    console.log('Advertiser logged in:', advertiserData);
}

function handleAdCreation(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const selectedPlan = formData.get('plan');
    const bannerFile = document.getElementById('banner-input').files[0];
    
    const adData = {
        id: Date.now().toString(),
        companyName: formData.get('companyName'),
        businessType: formData.get('businessType'),
        contactEmail: formData.get('contactEmail'),
        contactPhone: formData.get('contactPhone'),
        adTitle: formData.get('adTitle'),
        adDescription: formData.get('adDescription'),
        plan: selectedPlan,
        price: selectedPlan === 'basic' ? 3 : 30,
        currency: 'USD',
        bannerFile: bannerFile,
        createdAt: new Date(),
        status: 'pending_payment'
    };
    
    // Show payment simulation
    showPaymentModal(adData);
    
    console.log('Ad created:', adData);
}

function showPaymentModal(adData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content payment-modal">
            <div class="modal-header">
                <h3>💳 Procesar Pago</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div class="payment-summary">
                    <h4>Resumen del Anuncio</h4>
                    <p><strong>Empresa:</strong> ${adData.companyName}</p>
                    <p><strong>Plan:</strong> ${adData.plan === 'basic' ? 'Básico' : 'Premium'}</p>
                    <p><strong>Precio:</strong> $${adData.price} USD</p>
                    <p><strong>Título:</strong> ${adData.adTitle}</p>
                </div>
                
                <div class="payment-methods">
                    <h4>Métodos de Pago Disponibles</h4>
                    <div class="payment-options">
                        <button class="payment-btn" onclick="processPayment('${adData.id}', 'visa')">
                            💳 Visa/Mastercard
                        </button>
                        <button class="payment-btn" onclick="processPayment('${adData.id}', 'paypal')">
                            🅿️ PayPal
                        </button>
                        <button class="payment-btn" onclick="processPayment('${adData.id}', 'crypto')">
                            ₿ USDC/USDT
                        </button>
                        <button class="payment-btn" onclick="processPayment('${adData.id}', 'bank')">
                            🏦 Transferencia Bancaria
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function processPayment(adId, method) {
    // Simulate payment processing
    const modal = document.querySelector('.modal-overlay');
    closeModal(modal.querySelector('.modal-close'));
    
    showSuccess('¡Pago procesado exitosamente! Tu anuncio será publicado en breve.');
    
    // Reset form
    document.getElementById('advertiser-login-form').reset();
    document.getElementById('create-ad-form').reset();
    showAdvertiserLogin();
    
    console.log(`Payment processed for ad ${adId} with method: ${method}`);
}

function setupBannerUpload() {
    const input = document.getElementById('banner-input');
    if (input) {
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const preview = document.getElementById('banner-preview');
                if (preview) {
                    preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Banner Preview">`;
                }
            }
        });
    }
}

function setupAdvertisingForms() {
    const loginForm = document.getElementById('advertiser-login-form');
    const createForm = document.getElementById('create-ad-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdvertiserLogin);
    }
    
    if (createForm) {
        createForm.addEventListener('submit', handleAdCreation);
    }
    
    setupBannerUpload();
}

// Global functions for HTML onclick handlers
window.showAdvertiserLogin = showAdvertiserLogin;
window.openBannerUpload = openBannerUpload;
window.selectPlan = selectPlan;
window.processPayment = processPayment;

window.closeModal = closeModal;

// Cache Management Functions
function clearCacheIfNeeded() {
    // Check if we need to clear cache (for development or updates)
    const lastClearVersion = localStorage.getItem('lastCacheClear');
    const currentVersion = '1.2.0';
    
    if (lastClearVersion !== currentVersion) {
        clearAllCaches();
        localStorage.setItem('lastCacheClear', currentVersion);
    }
}

// Service Worker functions REMOVIDAS - causaban problemas de cache
// function clearAllCaches() { ... }

// window.clearAllCaches = clearAllCaches; // REMOVIDO

// Firebase Storage Functions
async function uploadVehicleGallery(vehicleId, files) {
    try {
        const storage = firebase.storage();
        const uploadPromises = [];
        
        files.forEach((file, index) => {
            const fileName = `${file.type.startsWith('image/') ? 'photo' : 'video'}_${index + 1}_${Date.now()}`;
            const storageRef = storage.ref(`vehicles/${vehicleId}/gallery/${fileName}`);
            
            const uploadPromise = storageRef.put(file)
                .then((snapshot) => {
                    return snapshot.ref.getDownloadURL();
                });
            
            uploadPromises.push(uploadPromise);
        });
        
        const downloadURLs = await Promise.all(uploadPromises);
        return downloadURLs;
    } catch (error) {
        console.error('Error uploading gallery:', error);
        throw error;
    }
}

async function uploadAdvertisementBanner(adId, bannerFile) {
    try {
        const storage = firebase.storage();
        const fileName = `banner_${Date.now()}.${bannerFile.name.split('.').pop()}`;
        const storageRef = storage.ref(`advertisements/${adId}/banner_${fileName}`);
        
        const snapshot = await storageRef.put(bannerFile);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading banner:', error);
        throw error;
    }
}

async function deleteVehicleGallery(vehicleId, fileUrls) {
    try {
        const storage = firebase.storage();
        const deletePromises = fileUrls.map(url => {
            const fileRef = storage.refFromURL(url);
            return fileRef.delete();
        });
        
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting gallery:', error);
        throw error;
    }
}

// Updated publish vehicle function with Storage integration
async function publishVehicleWithStorage(vehicleData, galleryFiles) {
    try {
        // First, create the vehicle document in Firestore
        const db = firebase.firestore();
        const vehicleRef = await db.collection('vehicles').add({
            ...vehicleData,
            sellerId: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });
        
        // Then upload gallery files if any
        if (galleryFiles && galleryFiles.length > 0) {
            const galleryURLs = await uploadVehicleGallery(vehicleRef.id, galleryFiles);
            
            // Update vehicle document with gallery URLs
            await vehicleRef.update({
                gallery: galleryURLs
            });
        }
        
        return vehicleRef.id;
    } catch (error) {
        console.error('Error publishing vehicle:', error);
        throw error;
    }
}

window.uploadVehicleGallery = uploadVehicleGallery;
window.uploadAdvertisementBanner = uploadAdvertisementBanner;
window.deleteVehicleGallery = deleteVehicleGallery;
window.publishVehicleWithStorage = publishVehicleWithStorage;

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

// PWA Install Prompt
// PWA functions REMOVIDAS - causaban problemas de cache
// let deferredPrompt;

// function setupPWAInstallPrompt() {
//     // Listen for the beforeinstallprompt event
//     window.addEventListener('beforeinstallprompt', (e) => {
//         console.log('PWA install prompt available');
//         // Prevent the mini-infobar from appearing on mobile
//         e.preventDefault();
//         // Stash the event so it can be triggered later
//         deferredPrompt = e;
//         // Show install button/banner
//         showInstallBanner();
//     });

//     // Listen for the appinstalled event
//     window.addEventListener('appinstalled', () => {
//         console.log('PWA was installed');
//         hideInstallBanner();
//         deferredPrompt = null;
//     });
// }

// function showInstallBanner() {
//     // Check if already installed
//     if (window.matchMedia('(display-mode: standalone)').matches) {
//         return; // Already installed
//     }

//     // Create install banner
//     const banner = document.createElement('div');
//     banner.id = 'install-banner';
//     banner.innerHTML = `
//         <div class="install-banner">
//             <div class="install-content">
//                 <div class="install-icon">📱</div>
//                 <div class="install-text">
//                     <strong>Instalar AutoMarket</strong>
//                     <p>Agregá AutoMarket a tu pantalla de inicio para un acceso rápido</p>
//                 </div>
//                 <button class="install-btn" onclick="installPWA()">Instalar</button>
//                 <button class="install-close" onclick="hideInstallBanner()">×</button>
//             </div>
//         </div>
//     `;
    
//     document.body.appendChild(banner);
// }

// function hideInstallBanner() {
//     const banner = document.getElementById('install-banner');
//     if (banner) {
//         banner.remove();
//     }
// }

// function installPWA() {
//     if (deferredPrompt) {
//         // Show the install prompt
//         deferredPrompt.prompt();
//         // Wait for the user to respond to the prompt
//         deferredPrompt.userChoice.then((choiceResult) => {
//             if (choiceResult.outcome === 'accepted') {
//                 console.log('User accepted the install prompt');
//             } else {
//                 console.log('User dismissed the install prompt');
//             }
//             deferredPrompt = null;
//         });
//     }
// }

// Global functions for PWA REMOVIDAS
// window.installPWA = installPWA;
// window.hideInstallBanner = hideInstallBanner;
