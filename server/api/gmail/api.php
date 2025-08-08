<?php
/**
 * Gmail API Integration for Littlefield Heat Pumps
 * Handles fetching customer inquiries from Gmail
 */

require_once 'config.php';

class GmailAPI {
    private $config;
    
    public function __construct() {
        $this->config = GmailConfig::getConfig();
    }
    
    public function setCredentials($client_id, $client_secret) {
        GmailConfig::setCredentials($client_id, $client_secret);
        $this->config = GmailConfig::getConfig();
    }
    
    public function getAuthorizationUrl() {
        return GmailConfig::getAuthUrl();
    }
    
    public function exchangeCodeForTokens($code) {
        $data = [
            'client_id' => $this->config['client_id'],
            'client_secret' => $this->config['client_secret'],
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => $this->config['redirect_uri']
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $tokens = json_decode($response, true);
            GmailConfig::saveTokens($tokens);
            return $tokens;
        }
        
        return false;
    }
    
    public function getCustomerInquiries($maxResults = 50) {
        if (!GmailConfig::isTokenValid()) {
            if (!GmailConfig::refreshAccessToken()) {
                throw new Exception('Gmail authentication required');
            }
        }
        
        $tokens = GmailConfig::getTokens();
        $accessToken = $tokens['access_token'];
        
        // Search for emails with "Customer Inquiry" in the subject
        $query = 'subject:"Customer Inquiry"';
        $url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?' . http_build_query([
            'q' => $query,
            'maxResults' => $maxResults
        ]);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            
            if (isset($data['messages'])) {
                $inquiries = [];
                foreach ($data['messages'] as $message) {
                    $messageDetails = $this->getMessageDetails($message['id'], $accessToken);
                    if ($messageDetails) {
                        $inquiries[] = $messageDetails;
                    }
                }
                return $inquiries;
            }
        }
        
        return [];
    }
    
    private function getMessageDetails($messageId, $accessToken) {
        $url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/{$messageId}";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $message = json_decode($response, true);
            return $this->parseMessage($message);
        }
        
        return null;
    }
    
    private function parseMessage($message) {
        $headers = $message['payload']['headers'];
        $inquiry = [
            'id' => $message['id'],
            'threadId' => $message['threadId'],
            'date' => '',
            'from' => '',
            'subject' => '',
            'body' => '',
            'snippet' => $message['snippet'],
            'labels' => $message['labelIds'] ?? []
        ];
        
        // Extract headers
        foreach ($headers as $header) {
            switch ($header['name']) {
                case 'Date':
                    $inquiry['date'] = date('Y-m-d H:i:s', strtotime($header['value']));
                    break;
                case 'From':
                    $inquiry['from'] = $header['value'];
                    break;
                case 'Subject':
                    $inquiry['subject'] = $header['value'];
                    break;
            }
        }
        
        // Extract body
        $inquiry['body'] = $this->extractBody($message['payload']);
        
        // Parse customer info from body or subject
        $inquiry = $this->parseCustomerInfo($inquiry);
        
        return $inquiry;
    }
    
    private function extractBody($payload) {
        if (isset($payload['body']['data'])) {
            return base64_decode(str_replace(['-', '_'], ['+', '/'], $payload['body']['data']));
        }
        
        if (isset($payload['parts'])) {
            foreach ($payload['parts'] as $part) {
                if ($part['mimeType'] === 'text/plain' && isset($part['body']['data'])) {
                    return base64_decode(str_replace(['-', '_'], ['+', '/'], $part['body']['data']));
                }
            }
        }
        
        return '';
    }
    
    private function parseCustomerInfo($inquiry) {
        // Extract customer name and contact info from email body
        $body = $inquiry['body'];
        
        // Look for common patterns in Formspree emails
        if (preg_match('/Full Name:\s*(.+)/i', $body, $matches)) {
            $inquiry['customer_name'] = trim($matches[1]);
        } elseif (preg_match('/Name:\s*(.+)/i', $body, $matches)) {
            $inquiry['customer_name'] = trim($matches[1]);
        }
        
        if (preg_match('/Contact Info:\s*(.+)/i', $body, $matches)) {
            $inquiry['contact_info'] = trim($matches[1]);
        } elseif (preg_match('/Email:\s*(.+)/i', $body, $matches)) {
            $inquiry['contact_info'] = trim($matches[1]);
        }
        
        if (preg_match('/Reason for Inquiry:\s*(.+)/i', $body, $matches)) {
            $inquiry['reason'] = trim($matches[1]);
        }
        
        if (preg_match('/Preferred Response:\s*(.+)/i', $body, $matches)) {
            $inquiry['preferred_response'] = trim($matches[1]);
        }
        
        if (preg_match('/Message:\s*(.+)/is', $body, $matches)) {
            $inquiry['message'] = trim($matches[1]);
        }
        
        // Set status based on labels or default to 'new'
        $inquiry['status'] = in_array('UNREAD', $inquiry['labels']) ? 'new' : 'read';
        
        return $inquiry;
    }
    
    public function markAsRead($messageId) {
        if (!GmailConfig::isTokenValid()) {
            if (!GmailConfig::refreshAccessToken()) {
                throw new Exception('Gmail authentication required');
            }
        }
        
        $tokens = GmailConfig::getTokens();
        $accessToken = $tokens['access_token'];
        
        $url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/{$messageId}/modify";
        $data = [
            'removeLabelIds' => ['UNREAD']
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return $httpCode === 200;
    }
    
    public function getConnectionStatus() {
        return [
            'configured' => !empty($this->config['client_id']) && !empty($this->config['client_secret']),
            'authenticated' => GmailConfig::isTokenValid(),
            'tokens_exist' => GmailConfig::getTokens() !== null
        ];
    }
}
?>
