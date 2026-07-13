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

?>
