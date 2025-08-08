/**
 * Admin Login System for Littlefield Heat Pumps
 * Handles authentication for the admin portal
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    const errorText = document.getElementById('error-text');
    
    // Admin users - in a real production environment, this would be handled server-side
    // This is just for demonstration purposes
    const adminUsers = [
        {
            username: 'josefahaz',
            // In a real application, passwords should never be stored in plain text
            // This is only for demonstration
            password: '@live1Christ',
            role: 'admin',
            name: 'Joe',
            fullName: 'Joe Fahaz',
            email: 'joe@example.com',
            phone: '(555) 123-4567',
            position: 'Website Administrator',
            permissions: ['manage_website', 'manage_content', 'view_inquiries', 'manage_invoices', 'manage_settings', 'manage_users'],
            lastLogin: '2025-07-15T16:30:00',
            profileImage: '../Images/admin-profile.png'
        },
        {
            username: 'owner',
            password: 'littlefield2024',
            role: 'owner',
            name: 'Harold',
            fullName: 'Harold Littlefield',
            email: 'harold.littlefieldheatpumps@gmail.com',
            phone: '(207) 951-2013',
            position: 'Owner',
            permissions: ['manage_website', 'manage_content', 'view_inquiries', 'manage_invoices', 'manage_settings', 'manage_users'],
            lastLogin: '2025-07-14T09:15:00',
            profileImage: '../Images/haroldheadshot.png'
        }
    ];
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Simple authentication
            const user = authenticateUser(username, password);
            
            if (user) {
                // Store user info in session storage (would use more secure methods in production)
                // Update the last login time
                user.lastLogin = new Date().toISOString();
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirect to admin dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Show error message
                loginError.style.display = 'flex';
                errorText.textContent = 'Invalid username or password. Please try again.';
                
                // Clear password field
                document.getElementById('password').value = '';
            }
        });
    }
    
    // Authentication function
    function authenticateUser(username, password) {
        return adminUsers.find(user => 
            user.username === username && 
            user.password === password
        );
    }
    
    // Check if user is already logged in
    function checkLoginStatus() {
        const userData = sessionStorage.getItem('currentUser');
        
        if (userData) {
            const user = JSON.parse(userData);
            
            // Check if on login page and redirect if already logged in
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // If not logged in and not on login page, redirect to login
            if (!window.location.pathname.includes('login.html') && 
                window.location.pathname.includes('/admin/')) {
                window.location.href = 'login.html';
            }
        }
    }
    
    // Run login status check
    checkLoginStatus();
});
