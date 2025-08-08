/**
 * Admin Inquiries for Littlefield Heat Pumps
 * Handles customer inquiry management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Display user name in profile button
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name + "'s Profile";
    }

    // Handle logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Clear session storage
            sessionStorage.removeItem('currentUser');
            // Redirect to login
            window.location.href = 'login.html';
        });
    }
    
    // Handle refresh button
    const refreshButton = document.getElementById('refresh-inquiries');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // Add loading animation
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            
            // Simulate data refresh
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            }, 1500);
        });
    }
});
