/**
 * Script de Login - Gestiona la lógica de autenticación y formularios
 * Cambios de tabs, validación, simulación de login
 */

// ==================== ELEMENTOS DEL DOM ====================
const adminForm = document.getElementById('admin-form');
const cocineroForm = document.getElementById('cocinero-form');
const registerForm = document.getElementById('register-form');
const tabButtons = document.querySelectorAll('.tab-btn');
const successMessage = document.getElementById('success-message');

// ==================== GESTIÓN DE TABS ====================
/**
 * Cambia el formulario activo según el tab seleccionado
 * @param {string} tabName - El nombre del tab ('admin' o 'cocinero')
 */
function switchTab(tabName) {
    // Remover clase active de todos los tabs
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Ocultar todos los formularios
    adminForm.classList.remove('active');
    cocineroForm.classList.remove('active');
    
    // Activar tab y formulario seleccionados
    if (tabName === 'admin') {
        tabButtons[0].classList.add('active');
        adminForm.classList.add('active');
    } else if (tabName === 'cocinero') {
        tabButtons[1].classList.add('active');
        cocineroForm.classList.add('active');
    }
}

// Event listeners para los tabs
tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

// ==================== TOGGLE PASSWORD VISIBILITY ====================
/**
 * Alterna la visibilidad de la contraseña
 * @param {HTMLElement} button - El botón de toggle
 */
function togglePassword(button) {
    const inputWrapper = button.parentElement;
    const input = inputWrapper.querySelector('.form-input');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.style.color = 'var(--primary)';
    } else {
        input.type = 'password';
        button.style.color = 'var(--gray-400)';
    }
}

// ==================== TOGGLE REGISTER/LOGIN ====================
/**
 * Cambia entre formulario de login y registro
 * @param {string} role - Rol seleccionado (admin, cocinero, o undefined para volver)
 */
function toggleRegister(role) {
    const allForms = [adminForm, cocineroForm, registerForm];
    
    if (!role) {
        // Volver al login
        registerForm.style.display = 'none';
        adminForm.classList.add('active');
        adminForm.style.display = 'block';
        switchTab('admin');
    } else {
        // Ir al registro
        adminForm.classList.remove('active');
        cocineroForm.classList.remove('active');
        adminForm.style.display = 'none';
        cocineroForm.style.display = 'none';
        registerForm.style.display = 'block';
        
        // Pre-seleccionar el rol en el formulario de registro
        const roleInputs = registerForm.querySelectorAll('input[name="role"]');
        roleInputs.forEach(input => {
            input.checked = input.value === role;
        });
    }
}

// ==================== VALIDACIÓN DE FORMULARIOS ====================
/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} Verdadero si es válido
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {string|null} Mensaje de error o null si es válida
 */
function validatePassword(password) {
    if (password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
}

/**
 * Muestra un error en el formulario
 * @param {HTMLFormElement} form - Formulario a validar
 * @param {string} fieldName - Nombre del campo con error
 * @param {string} message - Mensaje de error
 */
function showFieldError(form, fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.classList.add('error-shake');
        field.style.borderColor = 'var(--error)';
        
        // Remover animación después de completarse
        setTimeout(() => {
            field.classList.remove('error-shake');
        }, 300);
    }
}

// ==================== MANEJO DE ENVÍO DE FORMULARIOS ====================
/**
 * Simula el envío del formulario de login
 */
async function handleLoginSubmit(event, form, role) {
    event.preventDefault();
    
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const rememberMe = form.querySelector('input[name="remember"]').checked;
    
    // Validación
    if (!validateEmail(email)) {
        showFieldError(form, 'email', 'Email inválido');
        return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
        showFieldError(form, 'password', passwordError);
        return;
    }
    
    // Verificar credenciales contra localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password && u.role === role.toLowerCase());
    
    if (!user) {
        showFieldError(form, 'email', 'Credenciales inválidas');
        return;
    }
    
    // Guardar sesión actual
    const currentUser = { email, role: user.role, name: user.name };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Guardar email si está marcado "Recuérdame"
    if (rememberMe) {
        localStorage.setItem(`${form.id}_email`, email);
    }
    
    // Simular envío al servidor
    console.log(`Login ${role}:`, { email, rememberMe });
    
    // Mostrar mensaje de éxito
    showSuccessMessage(`Bienvenido ${user.name}!`, role);
    
    // En producción, aquí irías al servidor
    // const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify(...) })
}

/**
 * Simula el envío del formulario de registro
 */
async function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const name = registerForm.querySelector('input[name="name"]').value;
    const email = registerForm.querySelector('input[name="email"]').value;
    const password = registerForm.querySelector('input[name="password"]').value;
    const confirm = registerForm.querySelector('input[name="confirm"]').value;
    const role = document.querySelector('input[name="role"]:checked')?.value;
    const terms = registerForm.querySelector('input[name="terms"]').checked;
    
    // Validaciones
    if (!name.trim()) {
        showFieldError(registerForm, 'name', 'El nombre es requerido');
        return;
    }
    
    if (!validateEmail(email)) {
        showFieldError(registerForm, 'email', 'Email inválido');
        return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
        showFieldError(registerForm, 'password', passwordError);
        return;
    }
    
    if (password !== confirm) {
        showFieldError(registerForm, 'confirm', 'Las contraseñas no coinciden');
        return;
    }
    
    if (!role) {
        alert('Por favor selecciona un rol');
        return;
    }
    
    if (!terms) {
        alert('Debes aceptar los términos y condiciones');
        return;
    }
    
    // Guardar usuario en localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Verificar si el email ya existe
    if (users.some(u => u.email === email)) {
        showFieldError(registerForm, 'email', 'Este email ya está registrado');
        return;
    }
    
    // Agregar nuevo usuario
    users.push({ name, email, password, role });
    localStorage.setItem('users', JSON.stringify(users));
    
    // Guardar sesión actual
    const currentUser = { email, role, name };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Simular envío
    console.log('Registro exitoso:', { name, email, role });
    
    // Mostrar mensaje de éxito
    showSuccessMessage(`¡Bienvenido ${name}!`, role.charAt(0).toUpperCase() + role.slice(1));
    
    // En producción, aquí irías al servidor
    // const response = await fetch('/api/register', { method: 'POST', body: JSON.stringify(...) })
}

/**
 * Muestra el mensaje de éxito y redirige
 * @param {string} message - Mensaje de éxito
 * @param {string} role - Rol del usuario
 */
function showSuccessMessage(message, role) {
    const successText = document.getElementById('success-text');
    successText.textContent = message;
    
    // Mostrar mensaje
    successMessage.classList.add('show');
    successMessage.style.display = 'block';
    
    // Iniciar contador
    let countdown = 3;
    const countdownElement = document.getElementById('countdown');
    
    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(interval);
            // Redirigir según el rol
            if (role === 'admin' || role === 'Admin') {
                window.location.href = 'admin.html';
            } else if (role === 'cocinero' || role === 'Cocinero') {
                window.location.href = 'chef.html'; // Dashboard del cocinero
            }
        }
    }, 1000);
}

// ==================== EVENT LISTENERS PARA FORMULARIOS ====================
adminForm.addEventListener('submit', (e) => handleLoginSubmit(e, adminForm, 'Admin'));
cocineroForm.addEventListener('submit', (e) => handleLoginSubmit(e, cocineroForm, 'Cocinero'));
registerForm.addEventListener('submit', handleRegisterSubmit);

// ==================== UTILIDADES ADICIONALES ====================
/**
 * Guarda el email si "Recuérdame" está marcado
 */
function setupRememberMe() {
    const forms = [adminForm, cocineroForm];
    
    forms.forEach(form => {
        const emailInput = form.querySelector('input[name="email"]');
        const rememberCheckbox = form.querySelector('input[name="remember"]');
        const formKey = form.id;
        
        // Cargar email guardado
        const savedEmail = localStorage.getItem(`${formKey}_email`);
        if (savedEmail) {
            emailInput.value = savedEmail;
            rememberCheckbox.checked = true;
        }
        
        // Guardar email al cambiar
        rememberCheckbox.addEventListener('change', () => {
            if (rememberCheckbox.checked) {
                localStorage.setItem(`${formKey}_email`, emailInput.value);
            } else {
                localStorage.removeItem(`${formKey}_email`);
            }
        });
        
        emailInput.addEventListener('change', () => {
            if (rememberCheckbox.checked) {
                localStorage.setItem(`${formKey}_email`, emailInput.value);
            }
        });
    });
}

// Inicializar al cargar la página
setupRememberMe();

// ==================== TECLADO Y ACCESIBILIDAD ====================
/**
 * Permite navegar entre tabs con las flechas del teclado
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && tabButtons[0] !== document.activeElement) {
        tabButtons[0].click();
        tabButtons[0].focus();
    } else if (e.key === 'ArrowRight' && tabButtons[1] !== document.activeElement) {
        tabButtons[1].click();
        tabButtons[1].focus();
    }
});

// ==================== LOGS DE DESARROLLO ====================
console.log('✓ Script de login cargado correctamente');
console.log('Use toggleTab(\'admin\') o toggleTab(\'cocinero\') en consola para cambiar tabs');
console.log('Los datos se guardan en localStorage cuando marcas "Recuérdame"');
