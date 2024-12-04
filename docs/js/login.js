class AuthManager {
    constructor() {
        this.members = JSON.parse(localStorage.getItem('members')) || [];
        this.checkLoginStatus();
    }

    login(email, password) {
        const member = this.members.find(m => 
            m.email === email && m.password === password
        );
        
        if (member) {
            localStorage.setItem('currentUser', JSON.stringify(member));
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    checkLoginStatus() {
        const currentUser = this.getCurrentUser();
        const userStatus = document.getElementById('userStatus');
        const loginForm = document.getElementById('loginForm');
        
        if (currentUser) {
            document.getElementById('userName').textContent = currentUser.fullName;
            userStatus.style.display = 'block';
            loginForm.style.display = 'none';
            
            // If on login page, redirect to booking
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'booking.html';
            }
        } else {
            userStatus.style.display = 'none';
            loginForm.style.display = 'block';
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Handle login form submission
document.getElementById('loginFormElement').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    if (authManager.login(email, password)) {
        window.location.href = 'booking.html';
    } else {
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});

// Handle logout
window.logout = function() {
    authManager.logout();
};