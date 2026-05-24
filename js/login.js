/**
 * Auth POO - `UserService` + `AuthApp`
 * - `UserService` encapsula persistencia local y llamadas a backend (lista para Java)
 * - `AuthApp` maneja la interacción con el DOM usando clases/métodos
 */

class UserService {
    constructor(options = {}) {
        this.useBackend = options.useBackend || false;
        this.baseUrl = options.baseUrl || '/api';
    }

    async login(email, password, role) {
        if (this.useBackend) {
            const res = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            return res.json();
        }

        // Fallback localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password && u.role === role.toLowerCase());
        return user ? { success: true, user } : { success: false };
    }

    async register({ name, email, password, role }) {
        if (this.useBackend) {
            const res = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            return res.json();
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            return { success: false, error: 'EMAIL_EXISTS' };
        }
        users.push({ name, email, password, role });
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true, user: { name, email, role } };
    }

    saveCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

class AuthApp {
    constructor(options = {}) {
        this.userService = new UserService(options.serviceOptions);

        // DOM elements
        this.adminForm = document.getElementById('admin-form');
        this.cocineroForm = document.getElementById('cocinero-form');
        this.registerForm = document.getElementById('register-form');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.successMessage = document.getElementById('success-message');

        this.bindEvents();
        this.setupRememberMe();
        this.logReady();
    }

    bindEvents() {
        this.tabButtons.forEach(btn => btn.addEventListener('click', () => this.switchTab(btn.getAttribute('data-tab'))));

        this.adminForm.addEventListener('submit', (e) => this.handleLoginSubmit(e, this.adminForm, 'Admin'));
        this.cocineroForm.addEventListener('submit', (e) => this.handleLoginSubmit(e, this.cocineroForm, 'Cocinero'));
        this.registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));

        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));

        // Delegate password toggles (progressive enhancement)
        document.addEventListener('click', (e) => {
            if (e.target && e.target.matches('.toggle-password')) {
                this.togglePassword(e.target);
            }
            if (e.target && e.target.matches('[data-toggle-register]')) {
                const role = e.target.getAttribute('data-role');
                this.toggleRegister(role);
            }
        });
    }

    switchTab(tabName) {
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.adminForm.classList.remove('active');
        this.cocineroForm.classList.remove('active');

        if (tabName === 'admin') {
            this.tabButtons[0].classList.add('active');
            this.adminForm.classList.add('active');
        } else if (tabName === 'cocinero') {
            this.tabButtons[1].classList.add('active');
            this.cocineroForm.classList.add('active');
        }
    }

    togglePassword(button) {
        const inputWrapper = button.parentElement;
        const input = inputWrapper.querySelector('.form-input');
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        button.style.color = input.type === 'text' ? 'var(--primary)' : 'var(--gray-400)';
    }

    toggleRegister(role) {
        if (!role) {
            this.registerForm.style.display = 'none';
            this.adminForm.classList.add('active');
            this.adminForm.style.display = 'block';
            this.switchTab('admin');
            return;
        }

        this.adminForm.classList.remove('active');
        this.cocineroForm.classList.remove('active');
        this.adminForm.style.display = 'none';
        this.cocineroForm.style.display = 'none';
        this.registerForm.style.display = 'block';

        const roleInputs = this.registerForm.querySelectorAll('input[name="role"]');
        roleInputs.forEach(input => input.checked = input.value === role);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return null;
    }

    showFieldError(form, fieldName, message) {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.add('error-shake');
            field.style.borderColor = 'var(--error)';
            setTimeout(() => field.classList.remove('error-shake'), 300);
        }
    }

    async handleLoginSubmit(event, form, role) {
        event.preventDefault();
        const email = form.querySelector('input[name="email"]').value.trim();
        const password = form.querySelector('input[name="password"]').value;
        const rememberMe = form.querySelector('input[name="remember"]')?.checked;

        if (!this.validateEmail(email)) {
            this.showFieldError(form, 'email', 'Email inválido');
            return;
        }
        const passwordError = this.validatePassword(password);
        if (passwordError) {
            this.showFieldError(form, 'password', passwordError);
            return;
        }

        const result = await this.userService.login(email, password, role);
        if (!result || !result.success) {
            this.showFieldError(form, 'email', 'Credenciales inválidas');
            return;
        }

        const user = result.user;
        this.userService.saveCurrentUser({ email, role: user.role || role.toLowerCase(), name: user.name || '' });

        if (rememberMe) localStorage.setItem(`${form.id}_email`, email);

        console.log(`Login ${role}:`, { email, rememberMe });
        this.showSuccessMessage(`Bienvenido ${user.name || ''}!`, role);
    }

    async handleRegisterSubmit(event) {
        event.preventDefault();
        const name = this.registerForm.querySelector('input[name="name"]').value.trim();
        const email = this.registerForm.querySelector('input[name="email"]').value.trim();
        const password = this.registerForm.querySelector('input[name="password"]').value;
        const confirm = this.registerForm.querySelector('input[name="confirm"]').value;
        const role = this.registerForm.querySelector('input[name="role"]:checked')?.value;
        const terms = this.registerForm.querySelector('input[name="terms"]')?.checked;

        if (!name) { this.showFieldError(this.registerForm, 'name', 'El nombre es requerido'); return; }
        if (!this.validateEmail(email)) { this.showFieldError(this.registerForm, 'email', 'Email inválido'); return; }
        const pwdErr = this.validatePassword(password); if (pwdErr) { this.showFieldError(this.registerForm, 'password', pwdErr); return; }
        if (password !== confirm) { this.showFieldError(this.registerForm, 'confirm', 'Las contraseñas no coinciden'); return; }
        if (!role) { alert('Por favor selecciona un rol'); return; }
        if (!terms) { alert('Debes aceptar los términos y condiciones'); return; }

        const result = await this.userService.register({ name, email, password, role });
        if (!result.success) {
            if (result.error === 'EMAIL_EXISTS') this.showFieldError(this.registerForm, 'email', 'Este email ya está registrado');
            return;
        }

        this.userService.saveCurrentUser({ email, role, name });
        console.log('Registro exitoso:', { name, email, role });
        this.showSuccessMessage(`¡Bienvenido ${name}!`, role.charAt(0).toUpperCase() + role.slice(1));
    }

    showSuccessMessage(message, role) {
        const successText = document.getElementById('success-text');
        successText.textContent = message;
        this.successMessage.classList.add('show');
        this.successMessage.style.display = 'block';

        let countdown = 3;
        const countdownElement = document.getElementById('countdown');
        const interval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(interval);
                if (role.toLowerCase?.() === 'admin' || role === 'Admin') window.location.href = 'admin.html';
                else window.location.href = 'chef.html';
            }
        }, 1000);
    }

    setupRememberMe() {
        const forms = [this.adminForm, this.cocineroForm];
        forms.forEach(form => {
            const emailInput = form.querySelector('input[name="email"]');
            const rememberCheckbox = form.querySelector('input[name="remember"]');
            const formKey = form.id;
            const savedEmail = localStorage.getItem(`${formKey}_email`);
            if (savedEmail) { emailInput.value = savedEmail; rememberCheckbox.checked = true; }

            rememberCheckbox?.addEventListener('change', () => {
                if (rememberCheckbox.checked) localStorage.setItem(`${formKey}_email`, emailInput.value);
                else localStorage.removeItem(`${formKey}_email`);
            });

            emailInput?.addEventListener('change', () => {
                if (rememberCheckbox.checked) localStorage.setItem(`${formKey}_email`, emailInput.value);
            });
        });
    }

    handleKeyNavigation(e) {
        if (e.key === 'ArrowLeft' && this.tabButtons[0] !== document.activeElement) {
            this.tabButtons[0].click(); this.tabButtons[0].focus();
        } else if (e.key === 'ArrowRight' && this.tabButtons[1] !== document.activeElement) {
            this.tabButtons[1].click(); this.tabButtons[1].focus();
        }
    }

    logReady() {
        console.log('✓ AuthApp (POO) cargado correctamente');
        console.log('Use app.switchTab("admin") o app.switchTab("cocinero") en consola');
    }
}

// Inicializar la app con opción de backend (ajustable para Java)
const app = new AuthApp({ serviceOptions: { useBackend: false, baseUrl: '/api' } });

// Exportar helpers globales para los atributos onclick presentes en login.html
window.toggleRegister = (role) => app.toggleRegister(role);
window.togglePassword = (button) => app.togglePassword(button);

