<?php
/**
 * AMEPORT REST API - procesos, problemas y catalogos.
 * Requiere la migracion database/ameport_mvp_migration.sql.
 */

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://cgj563.com', 'http://localhost:5173', 'http://127.0.0.1:5173'];
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
} elseif (!$origin) {
    header('Access-Control-Allow-Origin: https://cgj563.com');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$configPath = __DIR__ . '/config.local.php';
$config = is_file($configPath) ? require $configPath : [];
$adminToken = getenv('CGJ_ADMIN_TOKEN');
if (($adminToken === false || $adminToken === '') && isset($config['admin_token'])) {
    $adminToken = $config['admin_token'];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    $providedToken = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (!$adminToken || !$providedToken || !hash_equals($adminToken, $providedToken)) {
        respond(['error' => 'Unauthorized'], 401);
    }
}

$host = getenv('CGJ_DB_HOST') ?: ($config['db_host'] ?? '');
$user = getenv('CGJ_DB_USER') ?: ($config['db_user'] ?? '');
$password = getenv('CGJ_DB_PASS') ?: ($config['db_pass'] ?? '');
$database = getenv('CGJ_DB_NAME') ?: ($config['db_name'] ?? '');
$conn = @new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    respond(['error' => 'AMEPORT database is not initialized. Execute the migration first.'], 503);
}
$conn->set_charset('utf8mb4');

$action = $_GET['action'] ?? 'catalogs';
try {
    switch ($action) {
        case 'catalogs':
            getCatalogs($conn);
            break;
        case 'processes':
            handleProcesses($conn, $method);
            break;
        case 'issues':
            handleIssues($conn, $method);
            break;
        case 'kpis':
            handleAmeportKpis($conn, $method);
            break;
        default:
            respond(['error' => 'Endpoint not found'], 404);
    }
} catch (mysqli_sql_exception $error) {
    respond(['error' => 'AMEPORT database is not initialized or is unavailable.'], 503);
} catch (Throwable $error) {
    respond(['error' => $error->getMessage()], 400);
}
$conn->close();

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function readPayload() {
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        respond(['error' => 'Invalid JSON payload'], 400);
    }
    return $payload;
}

function getCatalogs($conn) {
    $units = [];
    $result = $conn->query("SELECT id, code, name, business_group, description, data_classification FROM business_units WHERE active = 1 ORDER BY business_group, name");
    while ($row = $result->fetch_assoc()) $units[] = $row;

    $areas = [];
    $result = $conn->query("SELECT id, code, name, owner_name FROM areas WHERE active = 1 ORDER BY name");
    while ($row = $result->fetch_assoc()) $areas[] = $row;

    respond(['data' => ['business_units' => $units, 'areas' => $areas]]);
}

function handleProcesses($conn, $method) {
    if ($method === 'GET') {
        $unitCode = trim((string)($_GET['business_unit'] ?? ''));
        $sql = "SELECT p.*, u.code AS business_unit_code, u.name AS business_unit_name, a.name AS area_name
                FROM ameport_processes p
                JOIN business_units u ON u.id = p.business_unit_id
                LEFT JOIN areas a ON a.id = p.area_id
                WHERE p.deleted_at IS NULL";
        if ($unitCode !== '') {
            $safeUnit = $conn->real_escape_string($unitCode);
            $sql .= " AND u.code = '$safeUnit'";
        }
        $sql .= ' ORDER BY p.updated_at DESC, p.id DESC';
        $result = $conn->query($sql);
        $items = [];
        while ($row = $result->fetch_assoc()) $items[] = $row;
        respond(['data' => $items, 'total' => count($items)]);
    }

    if ($method === 'POST') {
        createProcess($conn);
        return;
    }

    if ($method === 'PUT') {
        updateProcess($conn, intval($_GET['id'] ?? 0));
        return;
    }

    respond(['error' => 'Method not allowed'], 405);
}

function createProcess($conn) {
    $data = readPayload();
    $code = trim((string)($data['code'] ?? ''));
    $name = trim((string)($data['name'] ?? ''));
    $unitId = intval($data['business_unit_id'] ?? 0);
    if ($code === '' || $name === '' || !$unitId) respond(['error' => 'Código, nombre y unidad son obligatorios'], 400);

    $stmt = $conn->prepare('INSERT INTO ameport_processes (code, name, business_unit_id, area_id, responsible_name, purpose, scope, as_is_description, current_risks, current_controls, gap_analysis, validation_reference, documentation_status, data_classification, created_by, updated_by) VALUES (?, ?, ?, NULLIF(?, 0), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $areaId = intval($data['area_id'] ?? 0);
    $responsible = trim((string)($data['responsible_name'] ?? ''));
    $purpose = trim((string)($data['purpose'] ?? ''));
    $scope = trim((string)($data['scope'] ?? ''));
    $asIs = trim((string)($data['as_is_description'] ?? ''));
    $risks = trim((string)($data['current_risks'] ?? ''));
    $controls = trim((string)($data['current_controls'] ?? ''));
    $gap = trim((string)($data['gap_analysis'] ?? ''));
    $validation = trim((string)($data['validation_reference'] ?? ''));
    $status = 'Identificado';
    $classification = trim((string)($data['data_classification'] ?? 'Declarado'));
    $createdBy = trim((string)($data['created_by'] ?? 'Dashboard'));
    $stmt->bind_param('ssiissssssssssss', $code, $name, $unitId, $areaId, $responsible, $purpose, $scope, $asIs, $risks, $controls, $gap, $validation, $status, $classification, $createdBy, $createdBy);
    if (!$stmt->execute()) respond(['error' => $stmt->error], 400);
    respond(['success' => true, 'id' => $conn->insert_id], 201);
}

function updateProcess($conn, $id) {
    if (!$id) respond(['error' => 'ID requerido'], 400);
    $data = readPayload();
    $status = trim((string)($data['documentation_status'] ?? ''));
    if ($status === 'Rediseño autorizado') {
        $required = ['responsible_name', 'scope', 'as_is_description', 'current_risks', 'current_controls', 'validation_reference', 'gap_analysis'];
        foreach ($required as $field) {
            if (trim((string)($data[$field] ?? '')) === '') respond(['error' => "No se puede autorizar el rediseño: falta $field"], 422);
        }
    }
    $allowed = ['responsible_name', 'purpose', 'scope', 'as_is_description', 'current_risks', 'current_controls', 'gap_analysis', 'validation_reference', 'documentation_status', 'data_classification'];
    $updates = [];
    $values = [];
    foreach ($allowed as $field) {
        if (array_key_exists($field, $data)) {
            $updates[] = "$field = ?";
            $values[] = (string)$data[$field];
        }
    }
    if (!$updates) respond(['error' => 'No hay campos para actualizar'], 400);
    $updates[] = 'updated_by = ?';
    $values[] = (string)($data['updated_by'] ?? 'Dashboard');
    $sql = 'UPDATE ameport_processes SET ' . implode(', ', $updates) . ', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL';
    $values[] = (string)$id;
    $stmt = $conn->prepare($sql);
    $types = str_repeat('s', count($values));
    $stmt->bind_param($types, ...$values);
    if (!$stmt->execute()) respond(['error' => $stmt->error], 400);
    respond(['success' => true]);
}

function handleIssues($conn, $method) {
    if ($method === 'GET') {
        $sql = "SELECT i.*, u.name AS business_unit_name, a.name AS area_name, p.name AS process_name
                FROM operational_issues i
                JOIN business_units u ON u.id = i.business_unit_id
                LEFT JOIN areas a ON a.id = i.area_id
                LEFT JOIN ameport_processes p ON p.id = i.process_id
                WHERE i.deleted_at IS NULL ORDER BY i.updated_at DESC, i.id DESC";
        $result = $conn->query($sql);
        $items = [];
        while ($row = $result->fetch_assoc()) $items[] = $row;
        respond(['data' => $items, 'total' => count($items)]);
    }
    if ($method === 'POST') {
        $data = readPayload();
        $required = ['code', 'title', 'business_unit_id', 'priority', 'reported_by', 'responsible_name'];
        foreach ($required as $field) if (trim((string)($data[$field] ?? '')) === '') respond(['error' => "Campo obligatorio: $field"], 400);
        $stmt = $conn->prepare('INSERT INTO operational_issues (code, title, description, business_unit_id, reported_by, responsible_name, priority, status, data_classification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $description = trim((string)($data['description'] ?? ''));
        $status = trim((string)($data['status'] ?? 'Registrado'));
        $classification = trim((string)($data['data_classification'] ?? 'Declarado'));
        $code = trim((string)$data['code']);
        $title = trim((string)$data['title']);
        $unitId = intval($data['business_unit_id']);
        $reportedBy = trim((string)$data['reported_by']);
        $responsible = trim((string)$data['responsible_name']);
        $priority = trim((string)$data['priority']);
        $stmt->bind_param('sssisssss', $code, $title, $description, $unitId, $reportedBy, $responsible, $priority, $status, $classification);
        if (!$stmt->execute()) respond(['error' => $stmt->error], 400);
        respond(['success' => true, 'id' => $conn->insert_id], 201);
    }
    respond(['error' => 'Method not allowed'], 405);
}

function handleAmeportKpis($conn, $method) {
    if ($method === 'GET') {
        $unitCode = trim((string)($_GET['business_unit'] ?? ''));
        $sql = "SELECT k.*, u.code AS business_unit_code, u.name AS business_unit_name, a.name AS area_name
                FROM kpis k
                JOIN business_units u ON u.id = k.business_unit_id
                LEFT JOIN areas a ON a.id = k.area_id
                WHERE k.business_unit_id IS NOT NULL";
        if ($unitCode !== '') {
            $safeUnit = $conn->real_escape_string($unitCode);
            $sql .= " AND u.code = '$safeUnit'";
        }
        $sql .= ' ORDER BY k.id DESC';
        $result = $conn->query($sql);
        $items = [];
        while ($row = $result->fetch_assoc()) $items[] = $row;
        respond(['data' => $items, 'total' => count($items)]);
    }

    if ($method === 'POST') {
        $data = readPayload();
        $required = ['code', 'nombre', 'business_unit_id', 'objetivo_gestion', 'frecuencia', 'responsable'];
        foreach ($required as $field) if (trim((string)($data[$field] ?? '')) === '') respond(['error' => "Campo obligatorio: $field"], 400);
        $stmt = $conn->prepare('INSERT INTO kpis (code, nombre, objetivo_gestion, formula, business_unit_id, area_id, measurement_unit, frecuencia, source_reference, responsable, warning_limit, critical_limit, data_classification) VALUES (?, ?, ?, ?, ?, NULLIF(?, 0), ?, ?, ?, ?, NULLIF(?, 0), NULLIF(?, 0), ?)');
        $code = trim((string)$data['code']);
        $name = trim((string)$data['nombre']);
        $objective = trim((string)$data['objetivo_gestion']);
        $formula = trim((string)($data['formula'] ?? ''));
        $unitId = intval($data['business_unit_id']);
        $areaId = intval($data['area_id'] ?? 0);
        $measurementUnit = trim((string)($data['measurement_unit'] ?? ''));
        $frequency = trim((string)$data['frecuencia']);
        $source = trim((string)($data['source_reference'] ?? ''));
        $responsible = trim((string)$data['responsable']);
        $warning = floatval($data['warning_limit'] ?? 0);
        $critical = floatval($data['critical_limit'] ?? 0);
        $classification = trim((string)($data['data_classification'] ?? 'Declarado'));
        $stmt->bind_param('ssssii' . 'ssss' . 'dds', $code, $name, $objective, $formula, $unitId, $areaId, $measurementUnit, $frequency, $source, $responsible, $warning, $critical, $classification);
        if (!$stmt->execute()) respond(['error' => $stmt->error], 400);
        respond(['success' => true, 'id' => $conn->insert_id], 201);
    }
    respond(['error' => 'Method not allowed'], 405);
}
