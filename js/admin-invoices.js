/**
 * Admin Invoices for Littlefield Heat Pumps
 * Handles invoice management and QuickBooks integration
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
    
    // Handle sync button
    const syncButton = document.getElementById('sync-invoices');
    if (syncButton) {
        syncButton.addEventListener('click', function() {
            syncInvoices();
        });
    }
    
    // Handle refresh button
    const refreshButton = document.getElementById('refresh-invoices');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            loadInvoicesFromStorage();
        });
    }
    
    // Load any previously synced invoices
    loadInvoicesFromStorage();
});

// Sync invoices from QuickBooks
function syncInvoices() {
    const syncButton = document.getElementById('sync-invoices');
    const originalHTML = syncButton.innerHTML;
    const statusElement = document.getElementById('invoice-status');
    
    // Show loading state
    syncButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    syncButton.disabled = true;
    
    // Simulate sync for now (replace with actual API call when QuickBooks is set up)
    setTimeout(() => {
        // Restore button
        syncButton.innerHTML = originalHTML;
        syncButton.disabled = false;
        
        // Show placeholder message
        statusElement.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>QuickBooks integration is not yet configured. Please set up QuickBooks connection in Settings first.</p>
        `;
    }, 2000);
}

// Load invoices from localStorage
function loadInvoicesFromStorage() {
    const invoices = JSON.parse(localStorage.getItem('quickbooks_invoices') || '[]');
    if (invoices.length > 0) {
        displayInvoices(invoices);
    } else {
        const statusElement = document.getElementById('invoice-status');
        statusElement.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>No invoices found. Click "Sync Now" to retrieve invoices from QuickBooks.</p>
        `;
    }
}

// Display invoices in the table
function displayInvoices(invoices) {
    const tableContainer = document.getElementById('invoice-table-container');
    const tableBody = document.getElementById('invoice-table-body');
    const statusElement = document.getElementById('invoice-status');
    const noInvoicesElement = document.getElementById('no-invoices');
    
    if (!invoices || invoices.length === 0) {
        tableContainer.style.display = 'none';
        statusElement.style.display = 'none';
        noInvoicesElement.style.display = 'block';
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add invoice rows
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.DocNumber || 'N/A'}</td>
            <td>${invoice.CustomerRef ? invoice.CustomerRef.name : 'N/A'}</td>
            <td>${invoice.TxnDate || 'N/A'}</td>
            <td>${invoice.DueDate || 'N/A'}</td>
            <td>$${invoice.TotalAmt || '0.00'}</td>
            <td><span class="status-badge ${getStatusClass(invoice.Balance)}">${getStatusText(invoice.Balance)}</span></td>
            <td>
                <button class="action-button view" onclick="viewInvoice('${invoice.Id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Show table and hide status
    tableContainer.style.display = 'block';
    statusElement.style.display = 'none';
    noInvoicesElement.style.display = 'none';
}

// Get status class for styling
function getStatusClass(balance) {
    if (!balance || balance === 0) return 'paid';
    return 'open';
}

// Get status text
function getStatusText(balance) {
    if (!balance || balance === 0) return 'Paid';
    return 'Open';
}

// View invoice details (placeholder function)
function viewInvoice(invoiceId) {
    alert(`Invoice details for ID: ${invoiceId}\n\nThis feature will be implemented with full QuickBooks integration.`);
}
