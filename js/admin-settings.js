/**
 * Admin Settings for Littlefield Heat Pumps
 * Handles QuickBooks integration settings and admin user management
 */

// Define admin users (synchronized with admin-login.js)
const adminUsers = [
    {
        username: 'josefahaz',
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

document.addEventListener('DOMContentLoaded', function() {
    // Add form submission handler for QuickBooks settings
    const qbSettingsForm = document.getElementById('quickbooks-settings-form');
    if (qbSettingsForm) {
        qbSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            saveQuickBooksSettings(); // Call our JavaScript function
        });
    }
    
    // Add form submission handler for QuickBooks sync settings
    const qbSyncForm = document.getElementById('quickbooks-sync-form');
    if (qbSyncForm) {
        qbSyncForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            saveQuickBooksSyncSettings(); // Call our JavaScript function
        });
    }
    
    // Add form submission handler for Gmail settings
    const gmailSettingsForm = document.getElementById('gmail-settings-form');
    if (gmailSettingsForm) {
        gmailSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            saveGmailSettings(); // Call our JavaScript function
        });
    }
    
    // Add form submission handler for Gmail sync settings
    const gmailSyncForm = document.getElementById('gmail-sync-form');
    if (gmailSyncForm) {
        gmailSyncForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            saveGmailSyncSettings(); // Call our JavaScript function
        });
    }

    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Check if user has permission to access settings
    if (!hasPermission(currentUser, 'manage_settings')) {
        showNotification('You do not have permission to access settings.', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
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
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // Navigation menu functionality
    document.getElementById('nav-inquiries').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'dashboard.html#inquiries';
    });

    document.getElementById('nav-invoices').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'dashboard.html#invoices';
    });

    // Load saved QuickBooks settings if available
    loadQuickBooksSettings();
    
    // Load saved Gmail settings if available
    loadGmailSettings();

    // Form submission handlers are already added above

    // Handle test connection button
    const testConnectionButton = document.getElementById('qb-test-connection');
    if (testConnectionButton) {
        testConnectionButton.addEventListener('click', function() {
            testQuickBooksConnection();
        });
    }
    
    // Handle QuickBooks authorize button
    const authorizeButton = document.getElementById('qb-authorize');
    if (authorizeButton) {
        authorizeButton.addEventListener('click', function() {
            authorizeQuickBooks();
        });
    }

    // Handle sync now button
    const syncNowButton = document.getElementById('qb-sync-now');
    if (syncNowButton) {
        syncNowButton.addEventListener('click', function() {
            syncQuickBooksNow();
        });
    }
    
    // Handle Gmail test connection button
    const gmailTestButton = document.getElementById('gmail-test-connection');
    if (gmailTestButton) {
        gmailTestButton.addEventListener('click', function() {
            testGmailConnection();
        });
    }
    
    // Handle Gmail authorize button
    const gmailAuthorizeButton = document.getElementById('gmail-authorize');
    if (gmailAuthorizeButton) {
        gmailAuthorizeButton.addEventListener('click', function(e) {
            e.preventDefault();
            authorizeGmail();
        });
    }
    
    // Handle Gmail sync now button
    const gmailSyncNowButton = document.getElementById('gmail-sync-now');
    if (gmailSyncNowButton) {
        gmailSyncNowButton.addEventListener('click', function() {
            syncGmailNow();
        });
    }

    // Load admin users
    loadAdminUsers();

    // Handle add admin button
    const addAdminButton = document.getElementById('add-admin-button');
    if (addAdminButton) {
        addAdminButton.addEventListener('click', function() {
            openAdminUserModal();
        });
    }

    // Handle admin user form submission
    const adminUserForm = document.getElementById('admin-user-form');
    if (adminUserForm) {
        adminUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAdminUser();
        });
    }
});

// Check if user has a specific permission
function hasPermission(user, permission) {
    return user.permissions && user.permissions.includes(permission);
}

// Load QuickBooks settings from localStorage
function loadQuickBooksSettings() {
    console.log('loadQuickBooksSettings() called');
    
    // Try both storage keys for compatibility
    const settings = JSON.parse(localStorage.getItem('quickbooks_config')) || JSON.parse(localStorage.getItem('qb_settings')) || {};
    
    console.log('Loaded settings:', settings);

    if (settings.clientId) {
        document.getElementById('qb-client-id').value = settings.clientId;
    }

    if (settings.clientSecret) {
        document.getElementById('qb-client-secret').value = settings.clientSecret;
    }

    if (settings.realmId) {
        document.getElementById('qb-realm-id').value = settings.realmId;
    }

    if (settings.environment) {
        document.getElementById('qb-environment').value = settings.environment;
    }

    // Update connection status
    updateConnectionStatus(settings.connected);

    // Load sync settings
    if (settings.sync) {
        document.getElementById('sync-invoices').checked = settings.sync.invoices !== false;
        document.getElementById('sync-customers').checked = settings.sync.customers !== false;
        document.getElementById('sync-payments').checked = settings.sync.payments !== false;

        if (settings.sync.frequency) {
            document.getElementById('sync-frequency').value = settings.sync.frequency;
        }
    }
}

// Save QuickBooks settings to server
function saveQuickBooksSettings() {
    console.log('saveQuickBooksSettings() called');
    
    const settings = {
        clientId: document.getElementById('qb-client-id').value,
        clientSecret: document.getElementById('qb-client-secret').value,
        realmId: document.getElementById('qb-realm-id').value,
        environment: document.getElementById('qb-environment').value,
        redirectUri: window.location.origin + '/Littlefield_Heat_Pumps/server/api/quickbooks/oauth-callback.php'
    };
    
    console.log('Settings to save:', settings);

    // Always save to localStorage first
    localStorage.setItem('quickbooks_config', JSON.stringify(settings));
    console.log('Saved to localStorage');

    // Check if we're running locally (file:// protocol)
    const isLocalFile = window.location.protocol === 'file:';
    console.log('Is local file:', isLocalFile, 'Protocol:', window.location.protocol);
    
    if (isLocalFile) {
        // When running locally, just save to localStorage
        localStorage.setItem('qb_settings', JSON.stringify({ ...JSON.parse(localStorage.getItem('qb_settings') || '{}'), connected: true }));
        showNotification('QuickBooks settings saved to localStorage (local development mode)', 'success');
        updateConnectionStatus(true, false); // Update UI to show connected but not authenticated
    } else {
        // Show immediate feedback
        showNotification('Saving QuickBooks settings...', 'info');
        
        // Create config directory and save server-side config
        fetch('/Littlefield_Heat_Pumps/server/api/quickbooks/save-config.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.success) {
                showNotification('QuickBooks settings saved successfully!', 'success');
                updateConnectionStatus(true, false); // Update UI to show connected
            } else {
                showNotification('Error saving QuickBooks settings: ' + (data.error || 'Unknown error'), 'error');
            }
        })
        .catch(error => {
            console.error('Error saving QuickBooks settings:', error);
            showNotification('Error saving QuickBooks settings: ' + error.message, 'error');
            // Fallback: at least we have localStorage
            showNotification('Settings saved to browser storage as fallback', 'warning');
        });
    }
}

// Save QuickBooks sync settings to localStorage
function saveQuickBooksSyncSettings() {
    const settings = JSON.parse(localStorage.getItem('qb_settings')) || {};

    settings.sync = {
        invoices: document.getElementById('sync-invoices').checked,
        customers: document.getElementById('sync-customers').checked,
        payments: document.getElementById('sync-payments').checked,
        frequency: document.getElementById('sync-frequency').value
    };

    localStorage.setItem('qb_settings', JSON.stringify(settings));

    showNotification('QuickBooks sync settings saved successfully!', 'success');
}

/**
 * Test QuickBooks connection
 */
function testQuickBooksConnection() {
    const button = document.getElementById('qb-test-connection');
    if (!button) return;

    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    button.disabled = true;

    // First save settings
    const settings = {
        clientId: document.getElementById('qb-client-id').value,
        clientSecret: document.getElementById('qb-client-secret').value,
        realmId: document.getElementById('qb-realm-id').value,
        environment: document.getElementById('qb-environment').value,
        redirectUri: window.location.origin + '/Littlefield_Heat_Pumps/server/api/quickbooks/oauth-callback.php'
    };

    // Check if required fields are filled
    if (!settings.clientId || !settings.clientSecret || !settings.realmId) {
        showNotification('Please fill in all required QuickBooks credentials.', 'error');
        button.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
        button.disabled = false;
        return false;
    }

    // Check if we're running locally (file:// protocol)
    const isLocalFile = window.location.protocol === 'file:';
    
    if (isLocalFile) {
        // When running locally, just save to localStorage and simulate successful connection
        localStorage.setItem('quickbooks_config', JSON.stringify(settings));
        localStorage.setItem('qb_settings', JSON.stringify({ ...JSON.parse(localStorage.getItem('qb_settings') || '{}'), connected: true }));
        
        button.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
        button.disabled = false;
        
        // Update UI to show connected but not authenticated
        updateConnectionStatus(true, false);
        
        // Show success notification and guidance for local testing
        showNotification('Settings saved to localStorage. In local development mode, server API calls are simulated.', 'success');
        
        // Make sure the authorize button is visible for UI consistency
        const authBtn = document.getElementById('qb-authorize');
        if (authBtn) {
            authBtn.style.display = 'inline-block';
        }
    } else {
        // Save to server via API
        fetch('/Littlefield_Heat_Pumps/server/api/quickbooks/save-config.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('QuickBooks settings saved successfully!', 'success');
                // Save locally too for UI consistency
                localStorage.setItem('quickbooks_config', JSON.stringify(settings));
                
                // Now test the connection
                return fetch('/Littlefield_Heat_Pumps/server/api/quickbooks/test-connection.php');
            } else {
                throw new Error(data.error || 'Failed to save settings');
            }
        })
        .then(response => response.json())
        .then(data => {
            button.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
            button.disabled = false;

            if (data.success) {
                // Update the connection status based on authentication status
                updateConnectionStatus(true, data.authenticated);

                if (data.authenticated) {
                    showNotification('QuickBooks connection successful and authenticated!', 'success');
                } else {
                    showNotification('QuickBooks connection successful but not authenticated. Click "Authorize QuickBooks" to connect.', 'warning');
                    // Make sure the authorize button is visible
                    const authBtn = document.getElementById('qb-authorize');
                    if (authBtn) {
                        authBtn.style.display = 'inline-block';
                    }
                }
            } else {
                updateConnectionStatus(false, false);
                showNotification('QuickBooks connection failed: ' + (data.error || 'Unknown error'), 'error');
            }
        })
        .catch(error => {
            console.error('Error with QuickBooks connection:', error);
            button.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
            button.disabled = false;
            updateConnectionStatus(false, false);
            showNotification('Error: ' + (error.message || 'Connection test failed'), 'error');
        });
    }
}

/**
 * Authorize QuickBooks via OAuth
 */
function authorizeQuickBooks() {
    const authBtn = document.getElementById('qb-authorize');
    if (!authBtn) return;

    // Show loading state
    authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    authBtn.disabled = true;
    
    // Get authorization URL from the server
    fetch('/Littlefield_Heat_Pumps/server/api/quickbooks/get-auth-url.php')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.authUrl) {
            // Set flag in localStorage to check auth status when page reloads
            localStorage.setItem('qb_auth_pending', 'true');
            
            // Open the authorization URL in a new window
            const authWindow = window.open(data.authUrl, '_blank', 'width=800,height=600');
            
            // Check if window was blocked by popup blocker
            if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
                showNotification('Popup blocked! Please allow popups for this site and try again.', 'error');
            } else {
                showNotification('Please complete the QuickBooks authorization in the new window.', 'info');
                
                // Set up an interval to check when the auth window is closed
                const authCheckInterval = setInterval(() => {
                    if (authWindow.closed) {
                        clearInterval(authCheckInterval);
                        // Wait a moment to allow the callback to process
                        setTimeout(() => {
                            // Test the connection after auth window closes
                            testQuickBooksConnection();
                        }, 1500);
                    }
                }, 500);
            }
            
            authBtn.innerHTML = '<i class="fas fa-key"></i> Authorize QuickBooks';
            authBtn.disabled = false;
        } else {
            authBtn.innerHTML = '<i class="fas fa-key"></i> Authorize QuickBooks';
            authBtn.disabled = false;
            showNotification('Error: ' + (data.error || 'Failed to get authorization URL'), 'error');
        }
    })
    .catch(error => {
        console.error('Error getting auth URL:', error);
        authBtn.innerHTML = '<i class="fas fa-key"></i> Authorize QuickBooks';
        authBtn.disabled = false;
        showNotification('Error getting auth URL: ' + error.message, 'error');
    });
    
    return;
    
    // Old local file handling code preserved for reference
    const isLocalFile = window.location.protocol === 'file:';
    
    if (false && isLocalFile) {
        // In local development mode, we can't do actual OAuth - simulate it
        setTimeout(() => {
            // Reset button state
            authBtn.innerHTML = '<i class="fas fa-key"></i> Authorize QuickBooks';
            authBtn.disabled = false;
            
            // Show a development mode notification
            showNotification(
                'Local Development Mode: QuickBooks authorization requires a web server. ' +
                'For full integration, please run this site via http://localhost using a local web server like XAMPP, WAMP, or PHP built-in server.', 
                'warning'
            );
            
            // For testing UI flow, mark as connected but not authenticated in localStorage
            localStorage.setItem('qb_settings', JSON.stringify({
                ...JSON.parse(localStorage.getItem('qb_settings') || '{}'),
                connected: true,
                authenticated: false
            }));
            
            // Update the UI
            updateConnectionStatus(true, false);
        }, 1000);
        
        return;
    }

    // Get authorization URL from the server
    fetch('/Littlefield_Heat_Pumps/server/api/quickbooks/get-auth-url.php')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.authUrl) {
            // Set flag in localStorage to check auth status when page reloads
            localStorage.setItem('qb_auth_pending', 'true');
            
            // Open the authorization URL in a new window
            const authWindow = window.open(data.authUrl, '_blank', 'width=800,height=600');
            
            // Check if window was blocked by popup blocker
            if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
                showNotification('Popup blocked! Please allow popups for this site and try again.', 'error');
            } else {
                showNotification('Please complete the QuickBooks authorization in the new window.', 'info');
                
                // Set up an interval to check when the auth window is closed
                const authCheckInterval = setInterval(() => {
                    if (authWindow.closed) {
                        clearInterval(authCheckInterval);
                        // Wait a moment to allow the callback to process
                        setTimeout(() => {
                            // Test the connection after auth window closes
                            testQuickBooksConnection();
                        }, 1500);
                    }
                }, 500);
            }
            
            authBtn.innerHTML = '<i class="fas fa-key"></i> Authorize QuickBooks';
            authBtn.disabled = false;
        } else {
            authBtn.innerHTML = '<i class="fas fa-key"></i> Authorize QuickBooks';
            authBtn.disabled = false;
            showNotification('Error: ' + (data.error || 'Failed to get authorization URL'), 'error');
        }
    })
    .catch(error => {
        console.error('Error getting auth URL:', error);
        authBtn.innerHTML = '<i class="fas fa-key"></i> Authorize QuickBooks';
        authBtn.disabled = false;
        showNotification('Error connecting to QuickBooks. Please try again.', 'error');
    });
}

// Update connection status indicator
function updateConnectionStatus(isConfigured = false, isAuthenticated = false) {
    const status = document.getElementById('qb-connection-status');
    const authBtn = document.getElementById('qb-authorize');

    if (!status || !authBtn) return;

    // If not explicitly provided, check local storage for configured state
    if (!isConfigured) {
        const config = JSON.parse(localStorage.getItem('quickbooks_config') || '{}');
        isConfigured = !!(config.clientId && config.clientSecret && config.realmId);
    }

    if (isConfigured) {
        if (isAuthenticated) {
            status.innerHTML = '<i class="fas fa-check-circle"></i> Connected & Authenticated';
            status.className = 'connected';
            authBtn.style.display = 'none'; // Already authenticated
        } else {
            status.innerHTML = '<i class="fas fa-exclamation-circle"></i> Connected, Authentication Required';
            status.className = 'partial';
            authBtn.style.display = 'inline-block'; // Need to authenticate
        }
    } else {
        status.innerHTML = '<i class="fas fa-times-circle"></i> Not connected';
        status.className = 'disconnected';
        authBtn.style.display = 'none';
    }

    // Store the connection status in localStorage for other pages
    const settings = JSON.parse(localStorage.getItem('qb_settings') || '{}');
    settings.connected = isConfigured;
    settings.authenticated = isAuthenticated;
    localStorage.setItem('qb_settings', JSON.stringify(settings));
}

// Sync QuickBooks now
async function syncQuickBooksNow() {
    const button = document.getElementById('qb-sync-now');
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    button.disabled = true;
    
    try {
        const settings = JSON.parse(localStorage.getItem('qb_settings')) || {};
        
        if (!settings.connected) {
            showNotification('Please connect to QuickBooks before syncing.', 'error');
            button.innerHTML = '<i class="fas fa-sync"></i> Sync Now';
            button.disabled = false;
            return;
        }
        
        // Call the actual QuickBooks sync API
        const response = await fetch('/Littlefield_Heat_Pumps/server/api/quickbooks/sync-invoices.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update last sync time and invoice count
            settings.lastSync = new Date().toISOString();
            settings.lastSyncData = {
                invoiceCount: result.data.count,
                syncTime: new Date().toISOString()
            };
            localStorage.setItem('qb_settings', JSON.stringify(settings));
            
            // Store synced invoices in localStorage for display
            localStorage.setItem('qb_invoices', JSON.stringify(result.data.invoices));
            
            showNotification(
                `QuickBooks sync completed successfully! Retrieved ${result.data.count} invoices.`, 
                'success'
            );
            
            // Update the UI to show synced data
            updateSyncStatus(result.data);
        } else {
            throw new Error(result.error || 'Unknown error occurred');
        }
        
    } catch (error) {
        console.error('Sync error:', error);
        showNotification(
            `Sync failed: ${error.message}`, 
            'error'
        );
    } finally {
        button.innerHTML = '<i class="fas fa-sync"></i> Sync Now';
        button.disabled = false;
    }
}

// Update sync status display
function updateSyncStatus(syncData) {
    // Update sync status in the UI
    const statusElement = document.getElementById('sync-status');
    if (statusElement) {
        statusElement.style.display = 'block';
        statusElement.innerHTML = `
            <div class="sync-summary">
                <h4><i class="fas fa-check-circle" style="color: #28a745;"></i> Last Sync: ${new Date().toLocaleString()}</h4>
                <p><strong>Invoices Retrieved:</strong> ${syncData.count}</p>
                <button onclick="showInvoiceDetails()" class="admin-button secondary" style="margin-top: 10px;">
                    <i class="fas fa-eye"></i> View Invoice Details
                </button>
            </div>
        `;
    }
}

// Show invoice details in a modal or expandable section
function showInvoiceDetails() {
    const invoices = JSON.parse(localStorage.getItem('qb_invoices') || '[]');
    
    if (invoices.length === 0) {
        showNotification('No invoice data available. Please sync first.', 'warning');
        return;
    }
    
    // Create a modal to display invoice details
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'invoiceDetailsModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">QuickBooks Invoice Details</h5>
                    <button type="button" class="close" onclick="closeInvoiceModal()">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Due Date</th>
                                    <th>Total</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoices.map(invoice => `
                                    <tr>
                                        <td>${invoice.docNumber}</td>
                                        <td>${invoice.customerRef.name}</td>
                                        <td>${new Date(invoice.txnDate).toLocaleDateString()}</td>
                                        <td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
                                        <td>$${parseFloat(invoice.totalAmt).toFixed(2)}</td>
                                        <td>$${parseFloat(invoice.balance).toFixed(2)}</td>
                                        <td>
                                            <span class="badge ${invoice.balance > 0 ? 'badge-warning' : 'badge-success'}">
                                                ${invoice.balance > 0 ? 'Outstanding' : 'Paid'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeInvoiceModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('invoiceDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    modal.classList.add('show');
}

// Close invoice details modal
function closeInvoiceModal() {
    const modal = document.getElementById('invoiceDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// Load admin users
function loadAdminUsers() {
    // Get admin users from admin-login.js
    const tbody = document.getElementById('admin-users-tbody');
    tbody.innerHTML = '';
    
    adminUsers.forEach((user, index) => {
        const tr = document.createElement('tr');
        
        // Format last login date
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        const formattedDate = lastLogin ? lastLogin.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Never';
        
        tr.innerHTML = `
            <td>${user.fullName}</td>
            <td>${user.username}</td>
            <td><span class="admin-status ${user.role}">${capitalizeFirstLetter(user.role)}</span></td>
            <td>${user.email || ''}</td>
            <td>${formattedDate}</td>
            <td class="actions">
                <button class="action-button edit" title="Edit" data-id="${index}"><i class="fas fa-edit"></i></button>
                <button class="action-button delete" title="Delete" data-id="${index}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Add event listeners to action buttons
    const editButtons = document.querySelectorAll('#admin-users-tbody .action-button.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            editAdminUser(userId);
        });
    });
    
    const deleteButtons = document.querySelectorAll('#admin-users-tbody .action-button.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            confirmDeleteAdminUser(userId);
        });
    });
}

// Open admin user modal for adding a new user
function openAdminUserModal(userId = null) {
    const modal = document.getElementById('admin-user-modal');
    const modalTitle = document.getElementById('modal-title');
    const submitButtonText = document.getElementById('submit-button-text');
    const form = document.getElementById('admin-user-form');
    
    // Clear form
    form.reset();
    
    // Set default permissions
    document.getElementById('perm-view-inquiries').checked = true;
    
    if (userId !== null) {
        // Edit existing user
        const user = adminUsers[userId];
        
        modalTitle.textContent = 'Edit Admin User';
        submitButtonText.textContent = 'Update User';
        
        document.getElementById('edit-user-id').value = userId;
        document.getElementById('admin-fullname').value = user.fullName || '';
        document.getElementById('admin-name').value = user.name || '';
        document.getElementById('admin-username').value = user.username || '';
        document.getElementById('admin-email').value = user.email || '';
        document.getElementById('admin-phone').value = user.phone || '';
        document.getElementById('admin-password').value = user.password || '';
        document.getElementById('admin-role').value = user.role || 'admin';
        
        // Set permissions
        if (user.permissions) {
            const permCheckboxes = document.querySelectorAll('input[name="permissions"]');
            permCheckboxes.forEach(checkbox => {
                checkbox.checked = user.permissions.includes(checkbox.value);
            });
        }
    } else {
        // Add new user
        modalTitle.textContent = 'Add New Admin User';
        submitButtonText.textContent = 'Add User';
        document.getElementById('edit-user-id').value = '';
    }
    
    modal.style.display = 'flex';
}

// Edit admin user
function editAdminUser(userId) {
    openAdminUserModal(userId);
}

// Confirm delete admin user
function confirmDeleteAdminUser(userId) {
    const user = adminUsers[userId];
    const modal = document.getElementById('confirm-modal');
    const message = document.getElementById('confirm-message');
    
    message.textContent = `Are you sure you want to delete the admin user "${user.fullName || user.username}"?`;
    
    modal.style.display = 'flex';
    
    // Set up confirm button
    const confirmButton = document.getElementById('confirm-yes');
    confirmButton.onclick = function() {
        deleteAdminUser(userId);
        closeModals();
    };
}

// Delete admin user
function deleteAdminUser(userId) {
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Check if trying to delete self
    if (adminUsers[userId].username === currentUser.username) {
        showNotification('You cannot delete your own account.', 'error');
        return;
    }
    
    // Check if trying to delete the last owner
    const isOwner = adminUsers[userId].role === 'owner';
    if (isOwner) {
        const ownerCount = adminUsers.filter(user => user.role === 'owner').length;
        if (ownerCount <= 1) {
            showNotification('Cannot delete the last owner account.', 'error');
            return;
        }
    }
    
    // Remove user from array
    adminUsers.splice(userId, 1);
    
    // Refresh the table
    loadAdminUsers();
    
    showNotification('Admin user deleted successfully.', 'success');
}

// Save admin user
function saveAdminUser() {
    const userId = document.getElementById('edit-user-id').value;
    const isNewUser = userId === '';
    
    // Get form values
    const fullName = document.getElementById('admin-fullname').value;
    const name = document.getElementById('admin-name').value;
    const username = document.getElementById('admin-username').value;
    const email = document.getElementById('admin-email').value;
    const phone = document.getElementById('admin-phone').value;
    const password = document.getElementById('admin-password').value;
    const role = document.getElementById('admin-role').value;
    
    // Get selected permissions
    const permCheckboxes = document.querySelectorAll('input[name="permissions"]:checked');
    const permissions = Array.from(permCheckboxes).map(checkbox => checkbox.value);
    
    // Validate form
    if (!fullName || !name || !username || !email || !password) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Check if username already exists (for new users)
    if (isNewUser && adminUsers.some(user => user.username === username)) {
        showNotification('Username already exists. Please choose a different username.', 'error');
        return;
    }
    
    // Create user object
    const user = {
        fullName,
        name,
        username,
        email,
        phone,
        password,
        role,
        permissions,
        lastLogin: null,
        profileImage: '../Images/admin-profile.png'
    };
    
    if (isNewUser) {
        // Add new user
        adminUsers.push(user);
    } else {
        // Update existing user
        adminUsers[userId] = user;
    }
    
    // Refresh the table
    loadAdminUsers();
    
    // Close modal
    closeModals();
    
    showNotification(`Admin user ${isNewUser ? 'added' : 'updated'} successfully.`, 'success');
}

// Close all modals
function closeModals() {
    const modals = document.querySelectorAll('.admin-modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show notification function
function showNotification(message, type = 'info') {
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

// ===== GMAIL INTEGRATION FUNCTIONS =====

// Load Gmail settings from localStorage
function loadGmailSettings() {
    const settings = JSON.parse(localStorage.getItem('gmail_settings')) || {};
    
    if (settings.clientId) {
        document.getElementById('gmail-client-id').value = settings.clientId;
    }
    
    if (settings.clientSecret) {
        document.getElementById('gmail-client-secret').value = settings.clientSecret;
    }
    
    if (settings.businessEmail) {
        document.getElementById('gmail-business-email').value = settings.businessEmail;
    }
    
    // Update connection status
    updateGmailConnectionStatus(settings.configured, settings.authenticated);
    
    // Load sync settings
    if (settings.sync) {
        document.getElementById('auto-sync-inquiries').checked = settings.sync.autoSync !== false;
        
        if (settings.sync.frequency) {
            document.getElementById('sync-frequency').value = settings.sync.frequency;
        }
        
        if (settings.sync.maxInquiries) {
            document.getElementById('max-inquiries').value = settings.sync.maxInquiries;
        }
    }
}

// Save Gmail settings
function saveGmailSettings() {
    const settings = {
        clientId: document.getElementById('gmail-client-id').value,
        clientSecret: document.getElementById('gmail-client-secret').value,
        businessEmail: document.getElementById('gmail-business-email').value,
        configured: true
    };
    
    // Check if required fields are filled
    if (!settings.clientId || !settings.clientSecret || !settings.businessEmail) {
        showNotification('Please fill in all required Gmail credentials.', 'error');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('gmail_settings', JSON.stringify(settings));
    
    showNotification('Gmail settings saved successfully!', 'success');
    updateGmailConnectionStatus(true, false);
}

// Save Gmail sync settings
function saveGmailSyncSettings() {
    const settings = JSON.parse(localStorage.getItem('gmail_settings')) || {};
    
    settings.sync = {
        autoSync: document.getElementById('auto-sync-inquiries').checked,
        frequency: document.getElementById('sync-frequency').value,
        maxInquiries: document.getElementById('max-inquiries').value
    };
    
    localStorage.setItem('gmail_settings', JSON.stringify(settings));
    
    showNotification('Gmail sync settings saved successfully!', 'success');
}

// Test Gmail connection
function testGmailConnection() {
    const button = document.getElementById('gmail-test-connection');
    if (!button) return;
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    button.disabled = true;
    
    const settings = {
        clientId: document.getElementById('gmail-client-id').value,
        clientSecret: document.getElementById('gmail-client-secret').value,
        businessEmail: document.getElementById('gmail-business-email').value
    };
    
    // Check if required fields are filled
    if (!settings.clientId || !settings.clientSecret || !settings.businessEmail) {
        showNotification('Please fill in all required Gmail credentials.', 'error');
        button.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
        button.disabled = false;
        return;
    }
    
    // Save settings first
    saveGmailSettings();
    
    // Simulate connection test (in production, this would make an API call)
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
        button.disabled = false;
        
        showNotification('Gmail connection test successful! Please authorize access to start syncing inquiries.', 'success');
        updateGmailConnectionStatus(true, false);
    }, 1500);
}

// Authorize Gmail access
function authorizeGmail() {
    const settings = JSON.parse(localStorage.getItem('gmail_settings'));
    
    if (!settings || !settings.clientId || !settings.clientSecret) {
        showNotification('Please save Gmail settings first.', 'error');
        return;
    }
    
    // Check if we're running locally (file:// protocol)
    const isLocalFile = window.location.protocol === 'file:';
    
    if (isLocalFile) {
        // For local development, simulate authorization
        showNotification('Gmail authorization simulated for local development. In production, this would open Google OAuth.', 'info');
        
        // Update settings to show authenticated
        settings.authenticated = true;
        localStorage.setItem('gmail_settings', JSON.stringify(settings));
        updateGmailConnectionStatus(true, true);
        
        return;
    }
    
    // In production, this would redirect to Google OAuth
    const authUrl = `/Littlefield_Heat_Pumps/server/api/gmail/oauth-callback.php?authorize=true`;
    
    // Open authorization in a popup
    const popup = window.open(authUrl, 'gmail_auth', 'width=600,height=600');
    
    // Check for popup completion
    const checkClosed = setInterval(() => {
        if (popup.closed) {
            clearInterval(checkClosed);
            // Check if authorization was successful
            setTimeout(() => {
                checkGmailAuthStatus();
            }, 1000);
        }
    }, 1000);
}

// Check Gmail authorization status
function checkGmailAuthStatus() {
    // In production, this would check the server for auth status
    // For now, simulate successful authorization
    const settings = JSON.parse(localStorage.getItem('gmail_settings')) || {};
    settings.authenticated = true;
    localStorage.setItem('gmail_settings', JSON.stringify(settings));
    
    updateGmailConnectionStatus(true, true);
    showNotification('Gmail authorization successful! You can now sync customer inquiries.', 'success');
}

// Update Gmail connection status indicator
function updateGmailConnectionStatus(isConfigured = false, isAuthenticated = false) {
    const statusElement = document.getElementById('gmail-connection-status');
    if (!statusElement) return;
    
    if (isAuthenticated) {
        statusElement.innerHTML = '<i class="fas fa-check-circle" style="color: #28a745;"></i> Connected & Authorized';
        statusElement.style.color = '#28a745';
    } else if (isConfigured) {
        statusElement.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i> Configured - Authorization Required';
        statusElement.style.color = '#ffc107';
    } else {
        statusElement.innerHTML = '<i class="fas fa-info-circle" style="color: #6c757d;"></i> Not Connected';
        statusElement.style.color = '#6c757d';
    }
}

// Sync Gmail inquiries now
function syncGmailNow() {
    const button = document.getElementById('gmail-sync-now');
    if (!button) return;
    
    const settings = JSON.parse(localStorage.getItem('gmail_settings'));
    
    if (!settings || !settings.authenticated) {
        showNotification('Please authorize Gmail access first.', 'error');
        return;
    }
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    button.disabled = true;
    
    // Check if we're running locally
    const isLocalFile = window.location.protocol === 'file:';
    
    if (isLocalFile) {
        // Simulate sync for local development
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-sync"></i> Sync Now';
            button.disabled = false;
            
            // Simulate successful sync with sample data
            const sampleInquiries = [
                {
                    id: 'sample1',
                    date: new Date().toISOString(),
                    customer_name: 'John Smith',
                    contact_info: 'john@example.com',
                    reason: 'Service Request',
                    message: 'Need heat pump maintenance'
                },
                {
                    id: 'sample2',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    customer_name: 'Jane Doe',
                    contact_info: 'jane@example.com',
                    reason: 'Quote',
                    message: 'Interested in heat pump installation'
                }
            ];
            
            // Store sample inquiries
            localStorage.setItem('gmail_inquiries', JSON.stringify(sampleInquiries));
            
            updateGmailSyncStatus({
                success: true,
                count: sampleInquiries.length,
                inquiries: sampleInquiries
            });
            
            showNotification(`Gmail sync completed! Found ${sampleInquiries.length} customer inquiries.`, 'success');
        }, 2000);
        
        return;
    }
    
    // In production, fetch from Gmail API
    fetch('/Littlefield_Heat_Pumps/server/api/gmail/fetch-inquiries.php')
        .then(response => response.json())
        .then(data => {
            button.innerHTML = '<i class="fas fa-sync"></i> Sync Now';
            button.disabled = false;
            
            if (data.success) {
                // Store inquiries
                localStorage.setItem('gmail_inquiries', JSON.stringify(data.inquiries));
                
                updateGmailSyncStatus(data);
                showNotification(`Gmail sync completed! Found ${data.count} customer inquiries.`, 'success');
            } else {
                showNotification('Gmail sync failed: ' + data.error, 'error');
            }
        })
        .catch(error => {
            button.innerHTML = '<i class="fas fa-sync"></i> Sync Now';
            button.disabled = false;
            
            console.error('Gmail sync error:', error);
            showNotification('Gmail sync failed: ' + error.message, 'error');
        });
}

// Update Gmail sync status display
function updateGmailSyncStatus(syncData) {
    const statusElement = document.getElementById('gmail-sync-status');
    const detailsElement = document.getElementById('gmail-sync-details');
    const showButton = document.getElementById('gmail-show-inquiries');
    
    if (statusElement && detailsElement) {
        statusElement.style.display = 'block';
        
        const lastSync = new Date().toLocaleString();
        detailsElement.textContent = `Last sync: ${lastSync} - Found ${syncData.count} inquiries`;
        
        if (showButton && syncData.count > 0) {
            showButton.style.display = 'inline-block';
            showButton.onclick = () => showGmailInquiriesModal();
        }
    }
}

// Show Gmail inquiries in a modal
function showGmailInquiriesModal() {
    const inquiries = JSON.parse(localStorage.getItem('gmail_inquiries')) || [];
    
    if (inquiries.length === 0) {
        showNotification('No inquiries found. Please sync first.', 'info');
        return;
    }
    
    // Create modal content
    let tableRows = '';
    inquiries.forEach(inquiry => {
        const date = new Date(inquiry.date).toLocaleDateString();
        tableRows += `
            <tr>
                <td>${date}</td>
                <td>${inquiry.customer_name}</td>
                <td>${inquiry.contact_info}</td>
                <td>${inquiry.reason}</td>
                <td>${inquiry.message.substring(0, 50)}...</td>
            </tr>
        `;
    });
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Customer Inquiries from Gmail</h2>
                <button class="close-modal" onclick="closeGmailInquiriesModal()">&times;</button>
            </div>
            <div class="modal-body">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Reason</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.id = 'gmail-inquiries-modal';
    modal.className = 'admin-modal';
    modal.innerHTML = modalContent;
    modal.style.display = 'block';
    
    document.body.appendChild(modal);
}

// Close Gmail inquiries modal
function closeGmailInquiriesModal() {
    const modal = document.getElementById('gmail-inquiries-modal');
    if (modal) {
        modal.remove();
    }
}
