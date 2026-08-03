<?php
/**
 * CGJ563 - API REST
 * Endpoints para gestión de KPIs, Procesos y Sistemas
 * Acceso: https://cgj563.com/api.php?action=kpis&method=GET
 */

header('Content-Type: application/json; charset=utf-8');

$allowed_origins = [
    'https://cgj563.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
} elseif (!$origin) {
    // Fallback for same-origin or direct calls without Origin header.
    header('Access-Control-Allow-Origin: https://cgj563.com');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function configOrFail($envKey, $localKey, $localConfig) {
    $envValue = getenv($envKey);
    if ($envValue !== false && $envValue !== '') {
        return $envValue;
    }

    $localValue = $localConfig[$localKey] ?? '';
    if ($localValue !== '') {
        return $localValue;
    }

    http_response_code(500);
    echo json_encode(['error' => "Missing server config: $envKey"]);
    exit;
}

function enforceWriteAuth($expectedToken) {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
        return;
    }

    if (!$expectedToken) {
        http_response_code(503);
        echo json_encode(['error' => 'Write operations are temporarily disabled by server policy.']);
        exit;
    }

    $providedToken = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (!$providedToken || !hash_equals($expectedToken, $providedToken)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

$localConfig = [];
$localConfigPath = __DIR__ . '/config.local.php';
if (is_file($localConfigPath)) {
    $loaded = require $localConfigPath;
    if (is_array($loaded)) {
        $localConfig = $loaded;
    }
}

// Configuración BD
$host = configOrFail('CGJ_DB_HOST', 'db_host', $localConfig);
$user = configOrFail('CGJ_DB_USER', 'db_user', $localConfig);
$password = configOrFail('CGJ_DB_PASS', 'db_pass', $localConfig);
$database = configOrFail('CGJ_DB_NAME', 'db_name', $localConfig);
$adminToken = getenv('CGJ_ADMIN_TOKEN');
if (($adminToken === false || $adminToken === '') && isset($localConfig['admin_token'])) {
    $adminToken = $localConfig['admin_token'];
}

enforceWriteAuth($adminToken);

$conn = new mysqli($host, $user, $password, $database);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed']));
}

// Router
$action = $_GET['action'] ?? 'kpis';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        case 'kpis':
            handleKPIs($conn, $method);
            break;
        case 'kpi_registros':
            handleKPIRegistros($conn, $method);
            break;
        case 'procesos':
            handleProcesos($conn, $method);
            break;
        case 'sistemas':
            handleSistemas($conn, $method);
            break;
        case 'problemas':
            handleProblemas($conn, $method);
            break;
        case 'integraciones':
            handleIntegraciones($conn, $method);
            break;
        case 'madurez':
            handleMadurez($conn, $method);
            break;
        case 'backlog':
            handleBacklog($conn, $method);
            break;
        case 'roadmap':
            handleRoadmap($conn, $method);
            break;
        case 'internal_users':
            handleInternalUsers($conn, $method);
            break;
        case 'gastos_personales':
            handleGastosPersonales($conn, $method);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();

// ================================
// FUNCIONES - KPI REGISTROS
// ================================

function handleKPIRegistros($conn, $method) {
    $id = $_GET['id'] ?? null;
    
    if ($method === 'POST') {
        createKPIRegistro($conn);
    } elseif ($method === 'DELETE') {
        deleteKPIRegistro($conn, $id);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

function createKPIRegistro($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $kpi_id = intval($data['kpi_id'] ?? 0);
    $valor_actual = floatval($data['valor_actual'] ?? 0);
    $valor_meta = floatval($data['valor_meta'] ?? 0);
    $periodo_mes = intval($data['periodo_mes'] ?? 1);
    $periodo_año = intval($data['periodo_año'] ?? date('Y'));
    $estado = $conn->real_escape_string($data['estado'] ?? 'On track');
    $registrado_por = $conn->real_escape_string($data['registrado_por'] ?? 'Sistema');
    
    if (!$kpi_id) {
        http_response_code(400);
        echo json_encode(['error' => 'KPI ID requerido']);
        return;
    }
    
    $sql = "INSERT INTO kpi_registros (kpi_id, valor_actual, valor_meta, periodo_mes, periodo_año, estado, registrado_por)
            VALUES ($kpi_id, $valor_actual, $valor_meta, $periodo_mes, $periodo_año, '$estado', '$registrado_por')";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function deleteKPIRegistro($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    $id = intval($id);
    $sql = "DELETE FROM kpi_registros WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

// ================================
// FUNCIONES - KPIs
// ================================

function handleKPIs($conn, $method) {
    $id = $_GET['id'] ?? null;
    
    if ($method === 'GET') {
        if ($id) {
            getKPIById($conn, $id);
        } else {
            getAllKPIs($conn);
        }
    } elseif ($method === 'POST') {
        createKPI($conn);
    } elseif ($method === 'PUT') {
        updateKPI($conn, $id);
    } elseif ($method === 'DELETE') {
        deleteKPI($conn, $id);
    }
}

function getAllKPIs($conn) {
    $sql = "SELECT * FROM kpis ORDER BY id";
    $result = $conn->query($sql);
    $kpis = [];
    
    while ($row = $result->fetch_assoc()) {
        $kpis[] = $row;
    }
    
    echo json_encode(['data' => $kpis, 'total' => count($kpis)]);
}

function getKPIById($conn, $id) {
    $id = intval($id);
    $sql = "SELECT * FROM kpis WHERE id = $id";
    $result = $conn->query($sql);
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'KPI not found']);
        return;
    }
    
    $kpi = $result->fetch_assoc();
    
    // Obtener histórico de registros
    $sql_registros = "SELECT * FROM kpi_registros WHERE kpi_id = $id ORDER BY periodo_año DESC, periodo_mes DESC LIMIT 12";
    $registros = [];
    $result_registros = $conn->query($sql_registros);
    while ($row = $result_registros->fetch_assoc()) {
        $registros[] = $row;
    }
    
    $kpi['registros'] = $registros;
    echo json_encode(['data' => $kpi]);
}

function createKPI($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $nombre = $conn->real_escape_string($data['nombre'] ?? '');
    $objetivo = $conn->real_escape_string($data['objetivo_gestion'] ?? '');
    $formula = $conn->real_escape_string($data['formula'] ?? '');
    $frecuencia = $conn->real_escape_string($data['frecuencia'] ?? 'Mensual');
    
    if (!$nombre) {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre requerido']);
        return;
    }
    
    $sql = "INSERT INTO kpis (nombre, objetivo_gestion, formula, frecuencia) 
            VALUES ('$nombre', '$objetivo', '$formula', '$frecuencia')";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function updateKPI($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    $id = intval($id);
    $data = json_decode(file_get_contents("php://input"), true);
    
    $updates = [];
    if (isset($data['nombre'])) $updates[] = "nombre = '" . $conn->real_escape_string($data['nombre']) . "'";
    if (isset($data['objetivo_gestion'])) $updates[] = "objetivo_gestion = '" . $conn->real_escape_string($data['objetivo_gestion']) . "'";
    if (isset($data['formula'])) $updates[] = "formula = '" . $conn->real_escape_string($data['formula']) . "'";
    if (isset($data['frecuencia'])) $updates[] = "frecuencia = '" . $conn->real_escape_string($data['frecuencia']) . "'";
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }
    
    $sql = "UPDATE kpis SET " . implode(', ', $updates) . ", actualizado_en = CURRENT_TIMESTAMP WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function deleteKPI($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    $id = intval($id);
    $sql = "DELETE FROM kpis WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

// ================================
// FUNCIONES - PROCESOS
// ================================

function handleProcesos($conn, $method) {
    $id = $_GET['id'] ?? null;
    
    if ($method === 'GET') {
        if ($id) {
            getProcesoById($conn, $id);
        } else {
            getAllProcesos($conn);
        }
    } elseif ($method === 'POST') {
        createProceso($conn);
    } elseif ($method === 'PUT') {
        updateProceso($conn, $id);
    } elseif ($method === 'DELETE') {
        deleteProceso($conn, $id);
    }
}

function getAllProcesos($conn) {
    $sql = "SELECT * FROM procesos ORDER BY prioridad DESC, nombre";
    $result = $conn->query($sql);
    $procesos = [];
    
    while ($row = $result->fetch_assoc()) {
        $procesos[] = $row;
    }
    
    echo json_encode(['data' => $procesos, 'total' => count($procesos)]);
}

function getProcesoById($conn, $id) {
    $id = intval($id);
    $sql = "SELECT * FROM procesos WHERE id = $id";
    $result = $conn->query($sql);
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Proceso not found']);
        return;
    }
    
    $proceso = $result->fetch_assoc();
    
    // Obtener documentación
    $sql_docs = "SELECT * FROM proceso_documentacion WHERE proceso_id = $id";
    $docs = [];
    $result_docs = $conn->query($sql_docs);
    while ($row = $result_docs->fetch_assoc()) {
        $docs[] = $row;
    }
    
    $proceso['documentacion'] = $docs;
    echo json_encode(['data' => $proceso]);
}

function createProceso($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $nombre = $conn->real_escape_string($data['nombre'] ?? '');
    $area = $conn->real_escape_string($data['area'] ?? '');
    $frecuencia = $conn->real_escape_string($data['frecuencia'] ?? '');
    $prioridad = $conn->real_escape_string($data['prioridad'] ?? 'Media');
    
    if (!$nombre) {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre requerido']);
        return;
    }
    
    $sql = "INSERT INTO procesos (nombre, area, frecuencia, prioridad, estado) 
            VALUES ('$nombre', '$area', '$frecuencia', '$prioridad', 'Activo')";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function updateProceso($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    $id = intval($id);
    $data = json_decode(file_get_contents("php://input"), true);
    
    $updates = [];
    if (isset($data['nombre'])) $updates[] = "nombre = '" . $conn->real_escape_string($data['nombre']) . "'";
    if (isset($data['area'])) $updates[] = "area = '" . $conn->real_escape_string($data['area']) . "'";
    if (isset($data['estado'])) $updates[] = "estado = '" . $conn->real_escape_string($data['estado']) . "'";
    if (isset($data['prioridad'])) $updates[] = "prioridad = '" . $conn->real_escape_string($data['prioridad']) . "'";
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }
    
    $sql = "UPDATE procesos SET " . implode(', ', $updates) . ", actualizado_en = CURRENT_TIMESTAMP WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function deleteProceso($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    $id = intval($id);
    $sql = "DELETE FROM procesos WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

// ================================
// FUNCIONES - SISTEMAS
// ================================

function handleSistemas($conn, $method) {
    $id = $_GET['id'] ?? null;
    
    if ($method === 'GET') {
        if ($id) {
            getSistemaById($conn, $id);
        } else {
            getAllSistemas($conn);
        }
    } elseif ($method === 'POST') {
        createSistema($conn);
    } elseif ($method === 'PUT') {
        updateSistema($conn, $id);
    } elseif ($method === 'DELETE') {
        deleteSistema($conn, $id);
    }
}

function getAllSistemas($conn) {
    $sql = "SELECT * FROM sistemas ORDER BY prioridad DESC, nombre";
    $result = $conn->query($sql);
    $sistemas = [];
    
    while ($row = $result->fetch_assoc()) {
        $sistemas[] = $row;
    }
    
    echo json_encode(['data' => $sistemas, 'total' => count($sistemas)]);
}

function getSistemaById($conn, $id) {
    $id = intval($id);
    $sql = "SELECT * FROM sistemas WHERE id = $id";
    $result = $conn->query($sql);
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Sistema not found']);
        return;
    }
    
    $sistema = $result->fetch_assoc();
    
    // Obtener integraciones
    $sql_integ = "SELECT * FROM sistema_integraciones WHERE sistema_origen_id = $id OR sistema_destino_id = $id";
    $integraciones = [];
    $result_integ = $conn->query($sql_integ);
    while ($row = $result_integ->fetch_assoc()) {
        $integraciones[] = $row;
    }
    
    $sistema['integraciones'] = $integraciones;
    echo json_encode(['data' => $sistema]);
}

function createSistema($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $nombre = $conn->real_escape_string($data['nombre'] ?? '');
    $area = $conn->real_escape_string($data['area_responsable'] ?? '');
    $prioridad = $conn->real_escape_string($data['prioridad'] ?? 'Media');
    
    if (!$nombre) {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre requerido']);
        return;
    }
    
    $sql = "INSERT INTO sistemas (nombre, area_responsable, prioridad, estado) 
            VALUES ('$nombre', '$area', '$prioridad', 'Operativo')";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function updateSistema($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    $id = intval($id);
    $data = json_decode(file_get_contents("php://input"), true);
    
    $updates = [];
    if (isset($data['nombre'])) $updates[] = "nombre = '" . $conn->real_escape_string($data['nombre']) . "'";
    if (isset($data['estado'])) $updates[] = "estado = '" . $conn->real_escape_string($data['estado']) . "'";
    if (isset($data['prioridad'])) $updates[] = "prioridad = '" . $conn->real_escape_string($data['prioridad']) . "'";
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }
    
    $sql = "UPDATE sistemas SET " . implode(', ', $updates) . ", actualizado_en = CURRENT_TIMESTAMP WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function deleteSistema($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }
    
    $id = intval($id);
    $sql = "DELETE FROM sistemas WHERE id = $id";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

// ================================
// FUNCIONES - PROBLEMAS
// ================================

function handleProblemas($conn, $method) {
    if ($method === 'GET') {
        getAllProblemas($conn);
    }
}

function getAllProblemas($conn) {
    $sql = "SELECT * FROM problemas ORDER BY prioridad_calculada DESC";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['data' => $data, 'total' => count($data)]);
}

// ================================
// FUNCIONES - INTEGRACIONES
// ================================

function handleIntegraciones($conn, $method) {
    if ($method === 'GET') {
        getAllIntegraciones($conn);
    }
}

function getAllIntegraciones($conn) {
    $sql = "SELECT * FROM integraciones ORDER BY criticidad DESC, sistema_origen";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['data' => $data, 'total' => count($data)]);
}

// ================================
// FUNCIONES - MADUREZ DIGITAL
// ================================

function handleMadurez($conn, $method) {
    if ($method === 'GET') {
        getAllMadurez($conn);
    }
}

function getAllMadurez($conn) {
    $sql = "SELECT * FROM madurez_digital ORDER BY dimension";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['data' => $data, 'total' => count($data)]);
}

// ================================
// FUNCIONES - BACKLOG FUNCIONAL
// ================================

function handleBacklog($conn, $method) {
    if ($method === 'GET') {
        getAllBacklog($conn);
    }
}

function getAllBacklog($conn) {
    $sql = "SELECT * FROM backlog_funcional ORDER BY prioridad DESC, epica";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['data' => $data, 'total' => count($data)]);
}

// ================================
// FUNCIONES - ROADMAP
// ================================

function handleRoadmap($conn, $method) {
    if ($method === 'GET') {
        getAllRoadmap($conn);
    }
}

function getAllRoadmap($conn) {
    $sql = "SELECT * FROM roadmap ORDER BY SUBSTR(fase, 6) ASC";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['data' => $data, 'total' => count($data)]);
}

// ================================
// FUNCIONES - APPS INTERNAS
// ================================

function ensureInternalAppsTables($conn) {
    $sqlUsers = "CREATE TABLE IF NOT EXISTS internal_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        rol ENUM('admin', 'usuario') DEFAULT 'usuario',
        activo TINYINT(1) DEFAULT 1,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";

    $sqlExpenses = "CREATE TABLE IF NOT EXISTS personal_expenses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        fecha DATE NOT NULL,
        concepto VARCHAR(200) NOT NULL,
        categoria VARCHAR(80) NOT NULL,
        monto DECIMAL(12,2) NOT NULL,
        metodo_pago VARCHAR(80),
        notas TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES internal_users(id) ON DELETE CASCADE
    )";

    $conn->query($sqlUsers);
    $conn->query($sqlExpenses);
}

function handleInternalUsers($conn, $method) {
    ensureInternalAppsTables($conn);
    $id = $_GET['id'] ?? null;

    if ($method === 'GET') {
        if ($id) {
            getInternalUserById($conn, $id);
        } else {
            getAllInternalUsers($conn);
        }
    } elseif ($method === 'POST') {
        createInternalUser($conn);
    } elseif ($method === 'PUT') {
        updateInternalUser($conn, $id);
    } elseif ($method === 'DELETE') {
        deleteInternalUser($conn, $id);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

function getAllInternalUsers($conn) {
    $sql = "SELECT * FROM internal_users ORDER BY activo DESC, nombre ASC";
    $result = $conn->query($sql);
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(['data' => $data, 'total' => count($data)]);
}

function getInternalUserById($conn, $id) {
    $id = intval($id);
    $sql = "SELECT * FROM internal_users WHERE id = $id LIMIT 1";
    $result = $conn->query($sql);

    if (!$result || $result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        return;
    }

    echo json_encode(['data' => $result->fetch_assoc()]);
}

function createInternalUser($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    $nombre = $conn->real_escape_string($data['nombre'] ?? '');
    $email = $conn->real_escape_string($data['email'] ?? '');
    $rol = $conn->real_escape_string($data['rol'] ?? 'usuario');

    if (!$nombre || !$email) {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre y email son requeridos']);
        return;
    }

    $sql = "INSERT INTO internal_users (nombre, email, rol, activo)
            VALUES ('$nombre', '$email', '$rol', 1)";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function updateInternalUser($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }

    $id = intval($id);
    $data = json_decode(file_get_contents('php://input'), true);

    $updates = [];
    if (isset($data['nombre'])) $updates[] = "nombre = '" . $conn->real_escape_string($data['nombre']) . "'";
    if (isset($data['email'])) $updates[] = "email = '" . $conn->real_escape_string($data['email']) . "'";
    if (isset($data['rol'])) $updates[] = "rol = '" . $conn->real_escape_string($data['rol']) . "'";
    if (isset($data['activo'])) $updates[] = "activo = " . (intval($data['activo']) ? 1 : 0);

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $sql = "UPDATE internal_users SET " . implode(', ', $updates) . " WHERE id = $id";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function deleteInternalUser($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }

    $id = intval($id);
    $sql = "DELETE FROM internal_users WHERE id = $id";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function handleGastosPersonales($conn, $method) {
    ensureInternalAppsTables($conn);
    $id = $_GET['id'] ?? null;
    $userId = $_GET['user_id'] ?? null;

    if ($method === 'GET') {
        if ($id) {
            getGastoPersonalById($conn, $id);
        } else {
            getAllGastosPersonales($conn, $userId);
        }
    } elseif ($method === 'POST') {
        createGastoPersonal($conn);
    } elseif ($method === 'PUT') {
        updateGastoPersonal($conn, $id);
    } elseif ($method === 'DELETE') {
        deleteGastoPersonal($conn, $id);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

function getAllGastosPersonales($conn, $userId = null) {
    $where = '';
    if ($userId) {
        $where = 'WHERE e.user_id = ' . intval($userId);
    }

    $sql = "SELECT e.*, u.nombre AS usuario_nombre
            FROM personal_expenses e
            INNER JOIN internal_users u ON u.id = e.user_id
            $where
            ORDER BY e.fecha DESC, e.id DESC";

    $result = $conn->query($sql);
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(['data' => $data, 'total' => count($data)]);
}

function getGastoPersonalById($conn, $id) {
    $id = intval($id);
    $sql = "SELECT e.*, u.nombre AS usuario_nombre
            FROM personal_expenses e
            INNER JOIN internal_users u ON u.id = e.user_id
            WHERE e.id = $id
            LIMIT 1";

    $result = $conn->query($sql);
    if (!$result || $result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Gasto no encontrado']);
        return;
    }

    echo json_encode(['data' => $result->fetch_assoc()]);
}

function createGastoPersonal($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    $userId = intval($data['user_id'] ?? 0);
    $fecha = $conn->real_escape_string($data['fecha'] ?? '');
    $concepto = $conn->real_escape_string($data['concepto'] ?? '');
    $categoria = $conn->real_escape_string($data['categoria'] ?? 'General');
    $monto = floatval($data['monto'] ?? 0);
    $metodoPago = $conn->real_escape_string($data['metodo_pago'] ?? '');
    $notas = $conn->real_escape_string($data['notas'] ?? '');

    if (!$userId || !$fecha || !$concepto || $monto <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id, fecha, concepto y monto son requeridos']);
        return;
    }

    $sql = "INSERT INTO personal_expenses (user_id, fecha, concepto, categoria, monto, metodo_pago, notas)
            VALUES ($userId, '$fecha', '$concepto', '$categoria', $monto, '$metodoPago', '$notas')";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function updateGastoPersonal($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }

    $id = intval($id);
    $data = json_decode(file_get_contents('php://input'), true);

    $updates = [];
    if (isset($data['user_id'])) $updates[] = 'user_id = ' . intval($data['user_id']);
    if (isset($data['fecha'])) $updates[] = "fecha = '" . $conn->real_escape_string($data['fecha']) . "'";
    if (isset($data['concepto'])) $updates[] = "concepto = '" . $conn->real_escape_string($data['concepto']) . "'";
    if (isset($data['categoria'])) $updates[] = "categoria = '" . $conn->real_escape_string($data['categoria']) . "'";
    if (isset($data['monto'])) $updates[] = 'monto = ' . floatval($data['monto']);
    if (isset($data['metodo_pago'])) $updates[] = "metodo_pago = '" . $conn->real_escape_string($data['metodo_pago']) . "'";
    if (isset($data['notas'])) $updates[] = "notas = '" . $conn->real_escape_string($data['notas']) . "'";

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $sql = "UPDATE personal_expenses SET " . implode(', ', $updates) . " WHERE id = $id";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

function deleteGastoPersonal($conn, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID requerido']);
        return;
    }

    $id = intval($id);
    $sql = "DELETE FROM personal_expenses WHERE id = $id";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $conn->error]);
    }
}

