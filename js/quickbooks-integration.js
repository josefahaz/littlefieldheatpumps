/**
 * QuickBooks Integration for Littlefield Heat Pumps
 * This file handles the QuickBooks payment integration and customer portal functionality
 */

// QuickBooks Configuration
const QuickBooksConfig = {
    // Configuration settings - these would be loaded from the admin settings in production
    customerPortalUrl: 'https://app.qbo.intuit.com/app/customerportal',
    paymentApiUrl: 'https://api.quickbooks.com/v3/company/',
    sandboxMode: true, // Set to false for production
    
    // Load configuration from localStorage if available (set in admin settings)
    loadConfig: function() {
        try {
            const savedConfig = localStorage.getItem('quickbooks_config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.clientId = config.clientId || '';
                this.clientSecret = config.clientSecret || '';
                this.realmId = config.realmId || '';
                this.environment = config.environment || 'sandbox';
                this.sandboxMode = config.environment !== 'production';
                console.log('QuickBooks configuration loaded from localStorage');
                return true;
            }
        } catch (error) {
            console.error('Error loading QuickBooks configuration:', error);
        }
        return false;
    },
    
    // Check if QuickBooks is properly configured
    isConfigured: function() {
        return this.clientId && this.clientSecret && this.realmId;
    },
    
    // Function to handle payment button click
    initPaymentButton: function() {
        const paymentButton = document.getElementById('quickbooks-payment');
        if (paymentButton) {
            paymentButton.addEventListener('click', (e) => {
                // Track the click event if analytics is available
                if (window.gtag) {
                    gtag('event', 'click', {
                        'event_category': 'payment',
                        'event_label': 'quickbooks_payment_button'
                    });
                }
                
                // Check if we have configuration loaded
                if (!this.loadConfig()) {
                    this.showNotification('QuickBooks not configured. Please contact the administrator.', 'error');
                    return;
                }
                
                // In a real implementation, we would generate a payment URL with the proper parameters
                // For now, we'll just open the customer portal or show the payment form
                if (this.isConfigured()) {
                    this.showPaymentForm();
                } else {
                    window.open(this.customerPortalUrl, '_blank');
                }
            });
        }
    },
    
    // Show the payment form modal
    showPaymentForm: function() {
        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
            // Reset form fields
            const form = paymentModal.querySelector('form');
            if (form) form.reset();
            
            // Show the modal
            paymentModal.style.display = 'flex';
            
            // Add event listener to close button
            const closeBtn = paymentModal.querySelector('.close-btn'); // Fixed class selector to match HTML
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    paymentModal.style.display = 'none';
                });
            }
            
            // Add event listener to form submission
            if (form) {
                // Remove any existing listeners to prevent duplicates
                const newForm = form.cloneNode(true);
                form.parentNode.replaceChild(newForm, form);
                
                newForm.addEventListener('submit', (e) => {
                    e.preventDefault(); // Prevent form submission
                    e.stopPropagation(); // Stop event propagation
                    this.processPayment(newForm);
                    return false; // Extra precaution against page refresh
                });
            }
        } else {
            // If modal doesn't exist, redirect to customer portal
            window.open(this.customerPortalUrl, '_blank');
        }
    },
    
    // Process the payment form
    processPayment: function(form) {
        // Get form data
        const formData = new FormData(form);
        const paymentData = {
            amount: formData.get('amount'),
            cardNumber: formData.get('card-number'),
            cardExpiry: formData.get('card-expiry'),
            cardCvv: formData.get('card-cvv'),
            cardName: formData.get('card-name'),
            invoiceNumber: formData.get('invoice-number') || '',
            email: formData.get('email')
        };
        
        // Validate form data
        if (!this.validatePaymentData(paymentData)) {
            return;
        }
        
        // In a real implementation, we would send this data to our server
        // which would then use the QuickBooks API to process the payment
        console.log('Processing payment:', paymentData);
        
        // Simulate payment processing
        this.showNotification('Processing payment...', 'info');
        
        // Simulate API call with timeout
        setTimeout(() => {
            // Simulate successful payment
            this.showNotification('Payment successful! A receipt has been sent to your email.', 'success');
            
            // Close the modal
            const paymentModal = document.getElementById('payment-modal');
            if (paymentModal) {
                paymentModal.style.display = 'none';
            }
            
            // Reset form
            form.reset();
        }, 2000);
    },
    
    // Validate payment data
    validatePaymentData: function(data) {
        // Check amount
        if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
            this.showNotification('Please enter a valid payment amount', 'error');
            return false;
        }
        
        // Check card number (basic validation)
        if (!data.cardNumber || data.cardNumber.replace(/\s/g, '').length < 13) {
            this.showNotification('Please enter a valid card number', 'error');
            return false;
        }
        
        // Check expiry date (MM/YY format)
        if (!data.cardExpiry || !/^\d{2}\/\d{2}$/.test(data.cardExpiry)) {
            this.showNotification('Please enter a valid expiry date (MM/YY)', 'error');
            return false;
        }
        
        // Check CVV (3-4 digits)
        if (!data.cardCvv || !/^\d{3,4}$/.test(data.cardCvv)) {
            this.showNotification('Please enter a valid CVV code', 'error');
            return false;
        }
        
        // Check card name
        if (!data.cardName || data.cardName.trim().length < 3) {
            this.showNotification('Please enter the name on the card', 'error');
            return false;
        }
        
        // Check email
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }
        
        return true;
    },
    
    // Function to initialize invoice lookup
    initInvoiceLookup: function() {
        const invoiceForm = document.getElementById('invoice-lookup-form');
        if (invoiceForm) {
            invoiceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const invoiceNumber = document.getElementById('invoice-number').value;
                const customerEmail = document.getElementById('customer-email').value;
                
                if (invoiceNumber && customerEmail) {
                    // Check if we have configuration loaded
                    if (!this.loadConfig()) {
                        this.showNotification('QuickBooks not configured. Please contact the administrator.', 'error');
                        return;
                    }
                    
                    // Here you would typically make an API call to your server
                    // which would then use QuickBooks API to fetch the invoice
                    console.log(`Looking up invoice: ${invoiceNumber} for customer: ${customerEmail}`);
                    
                    // Show loading message
                    this.showNotification('Looking up invoice...', 'info');
                    
                    // Simulate API call with timeout
                    setTimeout(() => {
                        // For demo purposes, show a success message and redirect
                        this.showNotification('Invoice found! Redirecting to payment page...', 'success');
                        
                        // Redirect to payment page or show payment form
                        setTimeout(() => {
                            this.showPaymentForm();
                        }, 1500);
                    }, 2000);
                } else {
                    this.showNotification('Please enter both invoice number and email address', 'error');
                }
            });
        }
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getIconForType(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Add event listener to close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    },
    
    // Get icon for notification type
    getIconForType: function(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'info':
            default: return 'fa-info-circle';
        }
    },
    
    // Initialize all QuickBooks related functionality
    init: function() {
        // Load configuration
        this.loadConfig();
        
        // Initialize components
        this.initPaymentButton();
        this.initInvoiceLookup();
        
        // Add cancel button functionality
        const cancelButtons = document.querySelectorAll('.payment-cancel');
        if (cancelButtons.length > 0) {
            cancelButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const paymentModal = document.getElementById('payment-modal');
                    if (paymentModal) {
                        paymentModal.style.display = 'none';
                    }
                });
            });
        }
        
        console.log('QuickBooks integration initialized');
    }
};

// Initialize QuickBooks integration when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    QuickBooksConfig.init();
});
