/**
 * Admin Dashboard for Littlefield Heat Pumps
 * Handles dashboard functionality and data management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Display admin name
    const adminNameElement = document.getElementById('admin-name');
    if (adminNameElement) {
        adminNameElement.textContent = currentUser.name;
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
    
    // Handle refresh data button
    const refreshButton = document.getElementById('refresh-data');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // Add loading animation
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            
            // Simulate data refresh (would be an API call in production)
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
                showNotification('Data refreshed successfully!', 'success');
            }, 1500);
        });
    }
    
    // Handle QuickBooks sync button
    const syncQBButton = document.getElementById('sync-quickbooks');
    if (syncQBButton) {
        syncQBButton.addEventListener('click', function() {
            // Add loading animation
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
            
            // Simulate QuickBooks sync (would be an API call in production)
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-sync"></i> Sync with QuickBooks';
                showNotification('QuickBooks data synced successfully!', 'success');
                
                // Update last synced time
                const now = new Date();
                const options = { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                };
                const formattedDate = now.toLocaleDateString('en-US', options);
                
                // Find the paragraph after status-indicator
                const statusElement = document.querySelector('.qb-integration-status p');
                if (statusElement) {
                    statusElement.textContent = `Last synced: ${formattedDate}`;
                }
            }, 2000);
        });
    }
    
    // Setup navigation event handlers
    setupNavigation();
    
    // Setup action buttons for tables
    setupTableActions();
});

// Navigation setup
function setupNavigation() {
    const navButtons = {
        'nav-inquiries': 'Customer Inquiries',
        'nav-invoices': 'Invoices',
        'nav-customers': 'Customers',
        'nav-settings': 'Settings'
    };
    
    // Add click handlers for navigation items
    for (const [id, title] of Object.entries(navButtons)) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all nav items
                document.querySelectorAll('.admin-nav a').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Handle actual navigation to the appropriate pages
                if (id === 'nav-settings') {
                    window.location.href = 'settings.html';
                } else if (id === 'nav-inquiries') {
                    window.location.href = 'inquiries.html';
                } else if (id === 'nav-invoices') {
                    window.location.href = 'invoices.html';
                } else {
                    // For other nav items that don't have pages yet
                    showNotification(`${title} page coming soon...`, 'info');
                }
            });
        }
    }
    
    // Also set up the QuickBooks Integration Settings button
    const qbSettingsButton = document.getElementById('qb-settings');
    if (qbSettingsButton) {
        qbSettingsButton.addEventListener('click', function() {
            window.location.href = 'settings.html';
        });
    }
}

// Setup table action buttons
function setupTableActions() {
    // View buttons
    document.querySelectorAll('.action-button.view').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const identifier = row.cells[0].textContent;
            showNotification(`Viewing details for ${identifier}`, 'info');
        });
    });
    
    // Edit buttons
    document.querySelectorAll('.action-button.edit').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const identifier = row.cells[0].textContent;
            showNotification(`Editing ${identifier}`, 'info');
        });
    });
    
    // Reply buttons
    document.querySelectorAll('.action-button.reply').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const name = row.cells[1].textContent;
            showNotification(`Replying to ${name}`, 'info');
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.action-button.delete').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const identifier = row.cells[0].textContent;
            
            if (confirm(`Are you sure you want to delete this item: ${identifier}?`)) {
                // Remove the row with animation
                row.style.backgroundColor = 'rgba(231, 76, 60, 0.2)';
                setTimeout(() => {
                    row.style.opacity = '0';
                    setTimeout(() => {
                        row.remove();
                        showNotification('Item deleted successfully', 'success');
                    }, 300);
                }, 300);
            }
        });
    });
    
    // View all buttons - navigate to appropriate pages
    document.querySelectorAll('[id^="view-all"]').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.id.replace('view-all-', '');
            // Navigate to the appropriate page instead of showing notification
            if (type === 'inquiries') {
                window.location.href = 'inquiries.html';
            } else if (type === 'invoices') {
                window.location.href = 'invoices.html';
            }
            // Removed the problematic notification
        });
    });
    
    // Create buttons
    document.querySelectorAll('[id^="create-"], [id^="schedule-"]').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.id.startsWith('create') ? 'Creating' : 'Scheduling';
            const type = this.id.replace(/^(create-|schedule-)/, '');
            showNotification(`${action} new ${type}...`, 'info');
        });
    });
}

// Show notification function
function showNotification(message, type = 'info') {
    // Check if notification container exists, create if not
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add styles for notification container
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
        notificationContainer.style.display = 'flex';
        notificationContainer.style.flexDirection = 'column';
        notificationContainer.style.gap = '10px';
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    // Set notification content
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="close-notification"><i class="fas fa-times"></i></button>
    `;
    
    // Style the notification
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.style.padding = '12px 15px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
    notification.style.marginBottom = '10px';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';
    
    // Set colors based on type
    if (type === 'success') {
        notification.style.backgroundColor = 'rgba(46, 204, 113, 0.9)';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
        notification.style.color = 'white';
    } else if (type === 'warning') {
        notification.style.backgroundColor = 'rgba(243, 156, 18, 0.9)';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
        notification.style.color = 'white';
    }
    
    // Style close button
    const closeButton = notification.querySelector('.close-notification');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'inherit';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginLeft = 'auto';
    closeButton.style.padding = '0';
    closeButton.style.fontSize = '14px';
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Add close handler
    closeButton.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

// Close notification function
function closeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';
    
    setTimeout(() => {
        notification.remove();
    }, 300);
}
