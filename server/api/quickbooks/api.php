<?php
/**
 * QuickBooks API Handler
 * 
 * This file contains the core functions for interacting with the QuickBooks API.
 */

require_once(__DIR__ . '/config.php');

/**
 * QuickBooks API Class
 * Handles all QuickBooks API interactions
 */
class QuickBooksAPI {
    private $config;
    private $tokens;
    private $baseUrl;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->config = loadQuickBooksConfig();
        $this->tokens = loadOAuthTokens();
        $this->baseUrl = getQuickBooksApiBaseUrl($this->config['environment']);
    }
    
    /**
     * Check if API is properly configured
     * 
     * @return boolean
     */
    public function isConfigured() {
        return !empty($this->config['clientId']) && 
               !empty($this->config['clientSecret']) && 
               !empty($this->config['realmId']);
    }
    
    /**
     * Check if API is authenticated (has valid tokens)
     * 
     * @return boolean
     */
    public function isAuthenticated() {
        // Check if tokens exist and not expired
        if (empty($this->tokens['access_token']) || empty($this->tokens['refresh_token'])) {
            return false;
        }
        
        // Check if token is expired
        if ($this->tokens['expires_at'] < time() + 60) { // 1 minute buffer
            // Try to refresh token
            return $this->refreshTokens();
        }
        
        return true;
    }
    
    /**
     * Start OAuth flow
     * 
     * @return string Authorization URL
     */
    public function getAuthorizationUrl() {
        // Ensure session is started for state storage
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // QuickBooks uses a different URL for OAuth authorization vs token exchange
        // Authorization: https://appcenter.intuit.com/connect/oauth2
        // Token exchange: https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
        $authUrl = 'https://appcenter.intuit.com/connect/oauth2';
        $params = [
            'client_id' => $this->config['clientId'],
            'response_type' => 'code',
            'scope' => $this->config['scope'],
            'redirect_uri' => $this->config['redirectUri'],
            'state' => bin2hex(random_bytes(16)) // CSRF protection
        ];
        
        // Store state for verification
        $_SESSION['qb_auth_state'] = $params['state'];
        
        return $authUrl . '?' . http_build_query($params);
    }
    
    /**
     * Process OAuth callback
     * 
     * @param string $code Authorization code
     * @param string $state State parameter for CSRF protection
     * @return boolean Success status
     */
    public function processCallback($code, $state) {
        // Verify state parameter (skip for manual OAuth tests)
        if ($state !== 'manual_test' && (empty($_SESSION['qb_auth_state']) || $_SESSION['qb_auth_state'] !== $state)) {
            return false;
        }
        
        // Exchange code for tokens
        $tokenUrl = getQuickBooksOAuthUrl($this->config['environment']) . 'tokens/bearer';
        $params = [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $this->config['redirectUri']
        ];
        
        $response = $this->makeTokenRequest($tokenUrl, $params);
        
        if (isset($response['access_token']) && isset($response['refresh_token'])) {
            // Store tokens
            $this->tokens = [
                'access_token' => $response['access_token'],
                'refresh_token' => $response['refresh_token'],
                'expires_at' => time() + $response['expires_in']
            ];
            
            saveOAuthTokens($this->tokens);
            return true;
        }
        
        return false;
    }
    
    /**
     * Refresh OAuth tokens
     * 
     * @return boolean Success status
     */
    public function refreshTokens() {
        if (empty($this->tokens['refresh_token'])) {
            return false;
        }
        
        $tokenUrl = getQuickBooksOAuthUrl($this->config['environment']) . 'tokens/bearer';
        $params = [
            'grant_type' => 'refresh_token',
            'refresh_token' => $this->tokens['refresh_token']
        ];
        
        $response = $this->makeTokenRequest($tokenUrl, $params);
        
        if (isset($response['access_token']) && isset($response['refresh_token'])) {
            // Store tokens
            $this->tokens = [
                'access_token' => $response['access_token'],
                'refresh_token' => $response['refresh_token'],
                'expires_at' => time() + $response['expires_in']
            ];
            
            saveOAuthTokens($this->tokens);
            return true;
        }
        
        return false;
    }
    
    /**
     * Make token request
     * 
     * @param string $url Token URL
     * @param array $params Request parameters
     * @return array Response data
     */
    private function makeTokenRequest($url, $params) {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Basic ' . base64_encode($this->config['clientId'] . ':' . $this->config['clientSecret']),
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    /**
     * Make API request
     * 
     * @param string $endpoint API endpoint
     * @param string $method HTTP method (GET, POST, etc.)
     * @param array $data Request data
     * @return array Response data
     */
    public function makeApiRequest($endpoint, $method = 'GET', $data = null) {
        if (!$this->isAuthenticated()) {
            return ['error' => 'Not authenticated'];
        }
        
        $url = $this->baseUrl . 'v3/company/' . $this->config['realmId'] . '/' . $endpoint;
        
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        
        if ($method === 'POST' || $method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->tokens['access_token'],
            'Accept: application/json',
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $responseData = json_decode($response, true);
        
        // Handle token expiration
        if ($httpCode === 401) {
            if ($this->refreshTokens()) {
                // Try again with new token
                return $this->makeApiRequest($endpoint, $method, $data);
            }
        }
        
        return $responseData;
    }
    
    /**
     * Get all invoices
     * 
     * @param int $limit Maximum number of invoices to retrieve (default: 100)
     * @param int $offset Offset for pagination (default: 0)
     * @return array Array of invoice data
     */
    public function getInvoices($limit = 100, $offset = 0) {
        $query = "SELECT * FROM Invoice ORDERBY Id DESC MAXRESULTS {$limit} STARTPOSITION {$offset}";
        $response = $this->makeApiRequest('query?query=' . urlencode($query));
        
        if (isset($response['QueryResponse']['Invoice'])) {
            return $response['QueryResponse']['Invoice'];
        }
        
        return [];
    }
    
    /**
     * Get invoice by ID or number
     * 
     * @param string $invoiceId Invoice ID or number
     * @return array Invoice data
     */
    public function getInvoice($invoiceId) {
        // First try to find by ID
        $response = $this->makeApiRequest('invoice/' . $invoiceId);
        
        if (isset($response['Invoice'])) {
            return $response['Invoice'];
        }
        
        // If not found by ID, try query
        $query = "SELECT * FROM Invoice WHERE DocNumber = '" . $invoiceId . "'";
        $response = $this->makeApiRequest('query?query=' . urlencode($query));
        
        if (isset($response['QueryResponse']['Invoice'][0])) {
            return $response['QueryResponse']['Invoice'][0];
        }
        
        return null;
    }
    
    /**
     * Get customer by email
     * 
     * @param string $email Customer email
     * @return array Customer data
     */
    public function getCustomerByEmail($email) {
        $query = "SELECT * FROM Customer WHERE PrimaryEmailAddr.Address = '" . $email . "'";
        $response = $this->makeApiRequest('query?query=' . urlencode($query));
        
        if (isset($response['QueryResponse']['Customer'][0])) {
            return $response['QueryResponse']['Customer'][0];
        }
        
        return null;
    }
    
    /**
     * Verify invoice belongs to customer
     * 
     * @param string $invoiceId Invoice ID or number
     * @param string $email Customer email
     * @return array|boolean Invoice data if verified, false otherwise
     */
    public function verifyInvoiceCustomer($invoiceId, $email) {
        $invoice = $this->getInvoice($invoiceId);
        
        if (!$invoice) {
            return false;
        }
        
        $customer = $this->getCustomerByEmail($email);
        
        if (!$customer) {
            return false;
        }
        
        // Verify invoice belongs to customer
        if (isset($invoice['CustomerRef']['value']) && 
            $invoice['CustomerRef']['value'] === $customer['Id']) {
            return $invoice;
        }
        
        return false;
    }
}

// Helper function to get payment URL
function getQuickBooksPaymentUrl($invoiceId) {
    $config = loadQuickBooksConfig();
    $baseUrl = ($config['environment'] === 'production') 
        ? 'https://app.qbo.intuit.com/' 
        : 'https://app.sandbox.qbo.intuit.com/';
        
    return $baseUrl . 'app/payment?invoiceId=' . $invoiceId . '&companyId=' . $config['realmId'];
}
