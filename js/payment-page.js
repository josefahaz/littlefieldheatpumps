/**
 * Payment Page JavaScript
 * Handles QuickBooks invoice lookup and payment processing
 */

/**
 * Show loading overlay with descriptive text
 * @param {HTMLElement} container - Container to show loading overlay in
 * @param {string} loadingText - Optional text to display during loading
 */
function showLoading(container, loadingText = 'Loading invoice details...') {
    // Remove any existing overlays
    const existingOverlay = container.querySelector('.loading-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Create and add loading overlay with high-contrast styling
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay active';
    
    // Create spinner with FontAwesome icon for better visibility
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
    
    // Create text element with high-contrast styling
    const textElement = document.createElement('div');
    textElement.className = 'loading-text';
    textElement.textContent = loadingText;
    textElement.setAttribute('role', 'status');
    textElement.setAttribute('aria-live', 'polite');
    
    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(textElement);
    container.appendChild(loadingOverlay);
    
    // Make sure container has position relative for absolute positioning of overlay
    if (window.getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize invoice lookup form
    const invoiceLookupForm = document.getElementById('invoice-lookup-form');
    if (invoiceLookupForm) {
        invoiceLookupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            lookupInvoice();
        });
    }
    
    // Initialize quickbooks payment button
    const quickbooksPaymentBtn = document.getElementById('quickbooks-payment');
    if (quickbooksPaymentBtn) {
        quickbooksPaymentBtn.addEventListener('click', function(e) {
            // Only intercept if we have an invoice selected
            if (!currentInvoice) {
                return; // Let the default link behavior happen
            }
            
            e.preventDefault();
            if (currentInvoice && currentInvoice.paymentUrl) {
                window.open(currentInvoice.paymentUrl, '_blank');
            } else {
                showNotification('No invoice selected or payment URL available.', 'error');
            }
        });
    }
});

// Store current invoice data
let currentInvoice = null;

/**
 * Look up invoice by number and email
 */
function lookupInvoice() {
    const invoiceNumber = document.getElementById('invoice-number').value.trim();
    const customerEmail = document.getElementById('customer-email').value.trim();
    
    // Validate inputs
    if (!invoiceNumber) {
        showNotification('Please enter an invoice number', 'error');
        return;
    }
    
    if (!customerEmail || !validateEmail(customerEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const invoiceLookup = document.querySelector('.invoice-lookup');
    const submitButton = document.querySelector('#invoice-lookup-form button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Add position-relative class if not already there
    if (!invoiceLookup.classList.contains('position-relative')) {
        invoiceLookup.classList.add('position-relative');
    }
    
    // Show loading overlay with descriptive text
    showLoading(invoiceLookup, 'Searching for invoice...');
    
    // Update button state
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    submitButton.disabled = true;
    
    // Clear previous results
    clearInvoiceDetails();
    currentInvoice = null;
    
    // Make API request
    fetch('/server/api/lookup-invoice.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            invoiceNumber: invoiceNumber,
            email: customerEmail
        })
    })
    .then(response => response.json())
    .then(data => {
        // Reset button and remove loading overlay
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
        // Remove loading overlay
        const loadingOverlay = invoiceLookup.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
        
        if (data.success && data.invoice) {
            // Store invoice data
            currentInvoice = data.invoice;
            
            // Display invoice details
            displayInvoiceDetails(data.invoice, data.customer);
            
            // Update payment button
            updatePaymentButton(data.invoice.paymentUrl);
            
            showNotification('Invoice found! You can now proceed with payment.', 'success');
        } else {
            showNotification(data.error || 'Invoice not found. Please check your information and try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error looking up invoice:', error);
        
        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
        // Remove loading overlay
        const loadingOverlay = invoiceLookup.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
        
        showNotification('Error looking up invoice. Please try again later.', 'error');
    });
}

/**
 * Display invoice details
 * 
 * @param {Object} invoice Invoice data
 * @param {Object} customer Customer data
 */
function displayInvoiceDetails(invoice, customer) {
    // Create invoice details container if it doesn't exist
    let detailsContainer = document.getElementById('invoice-details');
    if (!detailsContainer) {
        detailsContainer = document.createElement('div');
        detailsContainer.id = 'invoice-details';
        detailsContainer.className = 'invoice-details';
        
        // Add container to the page
        const invoiceLookup = document.querySelector('.invoice-lookup');
        if (invoiceLookup) {
            invoiceLookup.parentNode.insertBefore(detailsContainer, invoiceLookup.nextSibling);
        }
    }
    
    // Format currency
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    
    // Create invoice status badge with high contrast
    const statusClass = invoice.paid ? 'status-paid' : invoice.overdue ? 'status-overdue' : 'status-open';
    const statusIcon = invoice.paid ? 
        '<i class="fas fa-check-circle"></i>' : 
        invoice.overdue ? 
        '<i class="fas fa-exclamation-circle"></i>' : 
        '<i class="fas fa-clock"></i>';
    const statusText = invoice.paid ? 'Paid' : invoice.overdue ? 'Overdue' : 'Open';
    const statusBadge = `<span class="invoice-status ${statusClass}">${statusIcon} ${statusText}</span>`;
    
    // Build invoice HTML with improved structure for high contrast readability
    invoiceDetails.innerHTML = `
        <div class="invoice-header">
            <h3>Invoice #${invoice.number || invoice.id}</h3>
            ${statusBadge}
        </div>
        <div class="invoice-summary">
            <div class="summary-row">
                <span class="label">Issue Date:</span>
                <span class="value">${issueDate}</span>
            </div>
            <div class="summary-row">
                <span class="label">Due Date:</span>
                <span class="value">${dueDate}</span>
            </div>
            <div class="summary-row">
                <span class="label">Customer:</span>
                <span class="value">${invoice.customer || customer || 'Customer'}</span>
            </div>
            <div class="summary-row total">
                <span class="label">Total Amount:</span>
                <span class="value">${formatter.format(invoice.balance || invoice.totalAmount)}</span>
            </div>
        </div>
    `;
    
    // Add line items if available
    if (invoice.items && invoice.items.length > 0) {
        let lineItemsHtml = `
        <div class="invoice-items">
            <h4>Services</h4>
        `;
        
        invoice.items.forEach(item => {
            lineItemsHtml += `
            <div class="item-row">
                <div class="item-description">${item.description}</div>
                <div class="item-amount">${formatter.format(parseFloat(item.amount))}</div>
            </div>`;
        });
        
        lineItemsHtml += `</div>`;
        invoiceDetails.innerHTML += lineItemsHtml;
    }
    
    // Display additional sections based on invoice status
    if (invoice.paid) {
        invoiceDetails.innerHTML += `
            <div class="payment-instructions">
                <p><strong>Thank you!</strong> This invoice has been paid and receipted. No further action is required.</p>
            </div>
        `;
    } else {
        let paymentInstructions = '';
        if (invoice.overdue) {
            paymentInstructions = `<p><strong>This invoice is overdue.</strong> Please make payment as soon as possible.</p>`;
        } else {
            paymentInstructions = `<p>Please pay this invoice by ${dueDate}.</p>`;
        }
        
        invoiceDetails.innerHTML += `
            <div class="payment-instructions">
                ${paymentInstructions}
            </div>
            <div id="quickbooks-payment-container">
                <div class="payment-note">Click the button below to pay your invoice securely through QuickBooks.</div>
                <a href="#" id="quickbooks-payment" class="qb-payment-button" aria-label="Pay invoice securely through QuickBooks">Pay Invoice</a>
            </div>
        `;
        
        // Update payment button with invoice payment URL if available
        if (invoice.paymentUrl) {
            updatePaymentButton(invoice.paymentUrl);
        } else {
            // Show loading indicator for payment URL
            const paymentContainer = document.getElementById('quickbooks-payment-container');
            if (paymentContainer) {
                showLoading(paymentContainer, 'Preparing payment link...');
                
                // Simulate payment URL retrieval (in a real app, this would be an API call)
                setTimeout(() => {
                    const dummyPaymentUrl = 'https://quickbooks.intuit.com/payment/' + invoice.invoiceNumber;
                    updatePaymentButton(dummyPaymentUrl);
                }, 1500);
            }
        }
    }
    
    // Show invoice details
    invoiceDetails.style.display = 'block';
    
    // Scroll to invoice details
    detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Update payment button with payment URL
 * 
 * @param {string} paymentUrl Payment URL for QuickBooks
 */
function updatePaymentButton(paymentUrl) {
    const paymentButton = document.getElementById('quickbooks-payment');
    const paymentContainer = document.getElementById('quickbooks-payment-container');
    
    if (!paymentButton || !paymentContainer) return;
    
    // Remove any existing loading indicators
    const loader = paymentContainer.querySelector('.loading-overlay');
    if (loader) {
        loader.remove();
    }
    
    // Add active state to container
    paymentContainer.classList.add('active');
    
    // Set payment URL
    paymentButton.href = paymentUrl;
    
    // Add payment-ready indicator with high contrast styling
    const existingIndicator = paymentContainer.querySelector('.payment-ready-indicator');
    if (!existingIndicator) {
        const readyIndicator = document.createElement('div');
        readyIndicator.className = 'payment-ready-indicator';
        readyIndicator.innerHTML = '<i class="fas fa-check-circle"></i> Ready for payment';
        paymentContainer.insertBefore(readyIndicator, paymentButton);
    }
    
    // Add click event listener
    paymentButton.addEventListener('click', function(e) {
        // For development/demo purposes, prevent default and show success notification
        // In production, remove this line to allow redirect to QuickBooks payment page
        e.preventDefault();
        
        // Show loading overlay
        showLoading(paymentContainer, 'Processing payment request...');
        
        // Simulate payment processing
        setTimeout(() => {
            // Remove loading
            const loader = paymentContainer.querySelector('.loading-overlay');
            if (loader) {
                loader.remove();
            }
            
            // Show success message
            showNotification('Payment link opened in a new window. Please complete your payment on the QuickBooks secure payment page.', 'success');
            
            // In production, the following line would be uncommented to open payment in new tab
            // window.open(paymentUrl, '_blank');
        }, 1500);
    });
    
    // Add active class to payment button to enable pulse animation
    paymentButton.classList.add('active');
}

/**
 * Clear invoice details
 */
function clearInvoiceDetails() {
    const detailsContainer = document.getElementById('invoice-details');
    if (detailsContainer) {
        detailsContainer.style.display = 'none';
        detailsContainer.innerHTML = '';
    }
}

/**
 * Update payment button with invoice-specific URL
 * 
 * @param {string} paymentUrl Payment URL
 */
function updatePaymentButton(paymentUrl) {
    const paymentButton = document.getElementById('quickbooks-payment');
    const paymentContainer = document.getElementById('quickbooks-payment-container');
    const paymentNote = paymentContainer.querySelector('.payment-note');
    
    if (paymentButton && paymentUrl) {
        // Update button with invoice URL
        paymentButton.href = paymentUrl;
        paymentButton.classList.add('active');
        
        // Add active class to container for enhanced styling
        paymentContainer.classList.add('active');
        
        // Update button text to be more specific and accessible
        paymentButton.innerHTML = '<i class="fas fa-credit-card"></i> Pay This Invoice Now';
        paymentButton.setAttribute('aria-label', 'Pay invoice through QuickBooks secure payment portal');
        
        // Update the payment note to be more instructive with high contrast
        if (paymentNote) {
            paymentNote.innerHTML = 'Click the button above to pay your invoice securely through QuickBooks. <strong>Your invoice is ready for payment.</strong>';
            paymentNote.classList.add('active');
        }
        
        // Add a visual indicator that payment is ready
        const paymentReadyIndicator = document.createElement('div');
        paymentReadyIndicator.className = 'payment-ready-indicator';
        paymentReadyIndicator.innerHTML = '<i class="fas fa-check-circle"></i> Ready for payment';
        
        // Replace any existing indicator
        const existingIndicator = paymentContainer.querySelector('.payment-ready-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Add the indicator before the payment button
        paymentContainer.insertBefore(paymentReadyIndicator, paymentButton);
        
        // Scroll to payment button after a short delay for better UX
        setTimeout(() => {
            paymentContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 800);
    }
}

/**
 * Validate email format
 * 
 * @param {string} email Email to validate
 * @return {boolean} Is valid email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Show notification
 * 
 * @param {string} message Notification message
 * @param {string} type Notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Get icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    // Set content
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Add event listener to close button
    notification.querySelector('.close-notification').addEventListener('click', function() {
        notification.classList.add('fadeOut');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fadeOut');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}
