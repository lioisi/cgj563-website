<?php
/**
 * CGJ563 - API REST
 * Endpoints para gestión de KPIs, Procesos y Sistemas
 * Acceso: https://cgj563.com/api.php?action=kpis&method=GET
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración BD
$host = 'localhost';
$user = 'a0150879_dbcgj';
$password = '13GIbizelo';
$database = 'a0150879_dbcgj';

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
        case 'procesos':
            handleProcesos($conn, $method);
            break;
        case 'sistemas':
            handleSistemas($conn, $method);
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

?>
