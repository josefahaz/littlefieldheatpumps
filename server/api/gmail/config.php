<?php
/**
 * Gmail API Configuration for Littlefield Heat Pumps
 * Handles Gmail OAuth and API settings for customer inquiry integration
 */

class GmailConfig {
    private static $config = [
        'client_id' => '',
        'client_secret' => '',
        'redirect_uri' => 'http://localhost/Littlefield_Heat_Pumps/server/api/gmail/oauth-callback.php',
        'scope' => 'https://www.googleapis.com/auth/gmail.readonly',
        'access_type' => 'offline',
        'approval_prompt' => 'force'
    ];
    
    private static $tokens_file = __DIR__ . '/tokens.json';
    
    public static function getConfig() {
        return self::$config;
    }
    
    public static function setCredentials($client_id, $client_secret) {
        self::$config['client_id'] = $client_id;
        self::$config['client_secret'] = $client_secret;
    }
    
    public static function getAuthUrl() {
        $params = [
            'client_id' => self::$config['client_id'],
            'redirect_uri' => self::$config['redirect_uri'],
            'scope' => self::$config['scope'],
            'response_type' => 'code',
            'access_type' => self::$config['access_type'],
            'approval_prompt' => self::$config['approval_prompt']
        ];
        
        return 'https://accounts.google.com/o/oauth2/auth?' . http_build_query($params);
    }
    
    public static function saveTokens($tokens) {
        $tokens['timestamp'] = time();
        file_put_contents(self::$tokens_file, json_encode($tokens, JSON_PRETTY_PRINT));
    }
    
    public static function getTokens() {
        if (file_exists(self::$tokens_file)) {
            return json_decode(file_get_contents(self::$tokens_file), true);
        }
        return null;
    }
    
    public static function isTokenValid() {
        $tokens = self::getTokens();
        if (!$tokens || !isset($tokens['access_token'])) {
            return false;
        }
        
        // Check if token is expired (expires_in is in seconds)
        if (isset($tokens['expires_in']) && isset($tokens['timestamp'])) {
            $expiry_time = $tokens['timestamp'] + $tokens['expires_in'];
            return time() < $expiry_time;
        }
        
        return true;
    }
    
    public static function refreshAccessToken() {
        $tokens = self::getTokens();
        if (!$tokens || !isset($tokens['refresh_token'])) {
            return false;
        }
        
        $data = [
            'client_id' => self::$config['client_id'],
            'client_secret' => self::$config['client_secret'],
            'refresh_token' => $tokens['refresh_token'],
            'grant_type' => 'refresh_token'
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
            $newTokens = json_decode($response, true);
            // Merge with existing tokens to keep refresh_token
            $updatedTokens = array_merge($tokens, $newTokens);
            self::saveTokens($updatedTokens);
            return true;
        }
        
        return false;
    }
}
?>
