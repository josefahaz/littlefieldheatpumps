document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Set up logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // Find the user in adminUsers array
    let userProfile = null;
    for (const user of adminUsers) {
        if (user.username === currentUser.username) {
            userProfile = user;
            break;
        }
    }

    if (!userProfile) {
        console.error('User profile not found');
        return;
    }

    // Populate profile information
    document.getElementById('profile-name').textContent = userProfile.name;
    document.getElementById('profile-position').textContent = userProfile.position;
    document.getElementById('profile-fullname').textContent = userProfile.fullName;
    document.getElementById('profile-username').textContent = userProfile.username;
    document.getElementById('profile-email').textContent = userProfile.email;
    document.getElementById('profile-phone').textContent = userProfile.phone;
    
    // Format last login date
    const lastLogin = new Date(userProfile.lastLogin);
    const formattedDate = lastLogin.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('profile-last-login').textContent = formattedDate;

    // Set role badge
    const roleElement = document.getElementById('profile-role');
    roleElement.textContent = userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);
    roleElement.classList.add(userProfile.role);

    // Set profile image if available
    const profileImageContainer = document.getElementById('profile-image');
    if (userProfile.profileImage) {
        profileImageContainer.innerHTML = `<img src="${userProfile.profileImage}" alt="${userProfile.name}'s profile">`;
    }

    // Populate permissions
    const permissionsContainer = document.getElementById('permissions-container');
    if (permissionsContainer && userProfile.permissions) {
        permissionsContainer.innerHTML = '';
        
        const permissionLabels = {
            'manage_website': 'Manage Website',
            'manage_content': 'Manage Content',
            'view_inquiries': 'View Inquiries',
            'manage_invoices': 'Manage Invoices',
            'manage_settings': 'Manage Settings',
            'manage_users': 'Manage Users'
        };
        
        userProfile.permissions.forEach(permission => {
            const permissionElement = document.createElement('div');
            permissionElement.className = 'permission-item';
            
            const label = permissionLabels[permission] || permission;
            
            permissionElement.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${label}</span>
            `;
            
            permissionsContainer.appendChild(permissionElement);
        });
    }

    // Set up edit profile button
    document.getElementById('edit-profile').addEventListener('click', function() {
        showNotification('Profile editing is not available in this demo version.', 'info');
    });

    // Set up change password button
    document.getElementById('change-password').addEventListener('click', function() {
        showNotification('Password changing is not available in this demo version.', 'info');
    });

    // Set up change image button
    document.querySelector('.change-image-btn').addEventListener('click', function() {
        showNotification('Profile image changing is not available in this demo version.', 'info');
    });

    // Navigation menu functionality
    document.getElementById('nav-inquiries').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'dashboard.html#inquiries';
    });

    document.getElementById('nav-invoices').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'dashboard.html#invoices';
    });

    document.getElementById('nav-settings').addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Settings page is not available in this demo version.', 'info');
    });

    // Notification function
    function showNotification(message, type = 'success') {
        // Check if notification container exists, if not create it
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Set icon based on notification type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});
