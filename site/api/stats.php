<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

$statsFile = __DIR__ . '/stats.json';

// Stats dosyasını oku
function getStats() {
    global $statsFile;
    if (!file_exists($statsFile)) {
        $default = [
            'totalVisits' => 0,
            'totalScripts' => 0,
            'visitedIPs' => [],
            'lastUpdated' => date('Y-m-d H:i:s')
        ];
        file_put_contents($statsFile, json_encode($default, JSON_PRETTY_PRINT));
        return $default;
    }
    return json_decode(file_get_contents($statsFile), true);
}

// Stats dosyasını kaydet
function saveStats($stats) {
    global $statsFile;
    $stats['lastUpdated'] = date('Y-m-d H:i:s');
    file_put_contents($statsFile, json_encode($stats, JSON_PRETTY_PRINT));
}

// Kullanıcı IP'sini al
function getUserIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }
    return $_SERVER['REMOTE_ADDR'];
}

// IP hash'le (gizlilik için)
function hashIP($ip) {
    return hash('sha256', $ip . 'optwin_salt_2025');
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'get';
$stats = getStats();
$userIPHash = hashIP(getUserIP());

switch ($action) {
    case 'get':
        // Sadece public verileri döndür
        echo json_encode([
            'success' => true,
            'totalVisits' => $stats['totalVisits'],
            'totalScripts' => $stats['totalScripts']
        ]);
        break;
        
    case 'visit':
        // IP daha önce ziyaret etmediyse say
        if (!in_array($userIPHash, $stats['visitedIPs'])) {
            $stats['visitedIPs'][] = $userIPHash;
            $stats['totalVisits']++;
            saveStats($stats);
        }
        echo json_encode([
            'success' => true,
            'totalVisits' => $stats['totalVisits'],
            'totalScripts' => $stats['totalScripts']
        ]);
        break;
        
    case 'script':
        // Script oluşturma sayısını artır (her seferinde sayılır)
        $stats['totalScripts']++;
        saveStats($stats);
        echo json_encode([
            'success' => true,
            'totalVisits' => $stats['totalVisits'],
            'totalScripts' => $stats['totalScripts']
        ]);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
