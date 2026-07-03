<?php
/**
 * CGJ563 - Database Setup Script
 * Ejecutar desde: https://cgj563.com/setup-db.php
 */

// Configuración
$host = 'localhost';
$user = 'a0150879_dbcgj';
$password = '13GIbizelo';
$database = 'a0150879_dbcgj';

// Conectar a MySQL
$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");

echo "<h2>🔧 Creando Base de Datos CGJ563...</h2>";
echo "<hr>";

// SQL para crear tablas
$sql_commands = array(

    // 1. TABLA DE KPIs
    "CREATE TABLE IF NOT EXISTS kpis (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        objetivo_gestion VARCHAR(255),
        formula VARCHAR(255),
        fuente_actual VARCHAR(150),
        fuente_objetivo VARCHAR(150),
        frecuencia ENUM('Diaria', 'Semanal', 'Mensual', 'Trimestral', 'Anual'),
        responsable VARCHAR(100),
        disponibilidad VARCHAR(100),
        observaciones TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",

    // 2. TABLA DE REGISTROS DE KPIs
    "CREATE TABLE IF NOT EXISTS kpi_registros (
        id INT PRIMARY KEY AUTO_INCREMENT,
        kpi_id INT NOT NULL,
        valor_actual DECIMAL(10, 2),
        valor_meta DECIMAL(10, 2),
        periodo_mes INT,
        periodo_año INT,
        estado ENUM('On track', 'En riesgo', 'Crítico', 'Completado'),
        notas TEXT,
        registrado_por VARCHAR(100),
        registrado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kpi_id) REFERENCES kpis(id) ON DELETE CASCADE
    )",

    // 3. TABLA DE PROCESOS
    "CREATE TABLE IF NOT EXISTS procesos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(150) NOT NULL UNIQUE,
        area VARCHAR(100),
        responsable VARCHAR(100),
        frecuencia VARCHAR(100),
        sistema_soporte VARCHAR(150),
        entrada VARCHAR(255),
        salida VARCHAR(255),
        dolor_problema TEXT,
        impacto VARCHAR(50),
        prioridad ENUM('Baja', 'Media', 'Alta', 'Crítica'),
        estado ENUM('Activo', 'Pausado', 'Archivado'),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",

    // 4. TABLA DE DOCUMENTACIÓN
    "CREATE TABLE IF NOT EXISTS proceso_documentacion (
        id INT PRIMARY KEY AUTO_INCREMENT,
        proceso_id INT NOT NULL,
        titulo VARCHAR(200),
        tipo_documento ENUM('Procedimiento', 'Manual', 'Guía', 'Checklist', 'Política'),
        contenido LONGTEXT,
        archivo_url VARCHAR(255),
        version VARCHAR(20),
        autor VARCHAR(100),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (proceso_id) REFERENCES procesos(id) ON DELETE CASCADE
    )",

    // 5. TABLA DE SISTEMAS
    "CREATE TABLE IF NOT EXISTS sistemas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(150) NOT NULL UNIQUE,
        area_responsable VARCHAR(100),
        responsable_funcional VARCHAR(100),
        tecnologia_proveedor VARCHAR(150),
        usuarios_estimados INT,
        datos_principales TEXT,
        integra_con VARCHAR(255),
        tipo_integracion VARCHAR(100),
        problemas_observaciones TEXT,
        prioridad ENUM('Baja', 'Media', 'Alta', 'Crítica'),
        estado ENUM('Operativo', 'En desarrollo', 'Pausado', 'Descontinuado'),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",

    // 6. TABLA DE INTEGRACIONES
    "CREATE TABLE IF NOT EXISTS sistema_integraciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sistema_origen_id INT NOT NULL,
        sistema_destino_id INT NOT NULL,
        tipo_integracion VARCHAR(100),
        estado ENUM('Planificada', 'En desarrollo', 'Activa', 'Pausada'),
        documentacion TEXT,
        responsable VARCHAR(100),
        fecha_implementacion DATE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sistema_origen_id) REFERENCES sistemas(id) ON DELETE CASCADE,
        FOREIGN KEY (sistema_destino_id) REFERENCES sistemas(id) ON DELETE CASCADE
    )",

    // 7. TABLA DE USUARIOS
    "CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        rol ENUM('Admin', 'Editor', 'Visor', 'Responsable_KPI'),
        area VARCHAR(100),
        activo BOOLEAN DEFAULT TRUE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    // 8. TABLA DE AUDITORÍA
    "CREATE TABLE IF NOT EXISTS auditoria (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tabla VARCHAR(100),
        registro_id INT,
        accion ENUM('INSERT', 'UPDATE', 'DELETE'),
        usuario_id INT,
        cambios_anteriores JSON,
        cambios_nuevos JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )"
);

// Ejecutar comandos
$created = 0;
foreach ($sql_commands as $sql) {
    if ($conn->query($sql) === TRUE) {
        $created++;
        echo "✅ Tabla creada exitosamente<br>";
    } else {
        echo "⚠️ " . $conn->error . "<br>";
    }
}

echo "<hr>";

// Insertar KPIs iniciales
$kpis = array(
    array('Cobertura de servicios', 'Medir objetivos cubiertos', 'Servicios cubiertos / servicios planificados'),
    array('Presentismo', 'Controlar asistencia', 'Recursos presentes / recursos asignados'),
    array('Horas trabajadas', 'Base para gestión y liquidación', 'Suma de horas validadas'),
    array('Horas extras', 'Controlar desvíos y costos', 'Horas excedentes aprobadas'),
    array('Ausentismo', 'Medir faltas y reemplazos', 'Ausencias / asignaciones'),
    array('Costo por objetivo', 'Analizar rentabilidad', 'Costo total / objetivo'),
    array('Tiempo de cobertura de vacante', 'Medir reacción operativa', 'Fecha/hora cobertura - fecha/hora vacante')
);

foreach ($kpis as $kpi) {
    $sql = "INSERT IGNORE INTO kpis (nombre, objetivo_gestion, formula, frecuencia) 
            VALUES ('{$kpi[0]}', '{$kpi[1]}', '{$kpi[2]}', 'Diaria')";
    $conn->query($sql);
}

echo "<h3>📊 Datos iniciales cargados</h3>";
echo "<p>✅ KPIs insertados: " . count($kpis) . "</p>";

// Insertar procesos
$procesos = array(
    array('Asignación de recursos', 'Operaciones', 'Diaria'),
    array('Cobertura de objetivos', 'Operaciones', 'Diaria'),
    array('Postulación a servicios', 'Operaciones', 'Eventual'),
    array('Carga de novedades', 'Recursos', 'Diaria'),
    array('Liquidación de haberes', 'Administración', 'Mensual'),
    array('Extracción de KPIs', 'Gerencia', 'Mensual')
);

foreach ($procesos as $proceso) {
    $sql = "INSERT IGNORE INTO procesos (nombre, area, frecuencia, prioridad, estado) 
            VALUES ('{$proceso[0]}', '{$proceso[1]}', '{$proceso[2]}', 'Alta', 'Activo')";
    $conn->query($sql);
}

echo "<p>✅ Procesos insertados: " . count($procesos) . "</p>";

// Insertar sistemas
$sistemas = array(
    'RRHH', 'Liquidación de haberes', 'Sistema operativo de servicios',
    'Control de accesos', 'GPS / movilidad', 'CCTV / seguridad', 'Planillas Excel'
);

foreach ($sistemas as $sistema) {
    $sql = "INSERT IGNORE INTO sistemas (nombre, prioridad, estado) 
            VALUES ('{$sistema}', 'Alta', 'Operativo')";
    $conn->query($sql);
}

echo "<p>✅ Sistemas insertados: " . count($sistemas) . "</p>";

echo "<hr>";
echo "<h2>✅ Base de Datos Lista!</h2>";
echo "<p><strong>Tablas creadas:</strong> $created</p>";
echo "<p><a href='https://cgj563.com'>← Volver al sitio</a></p>";

$conn->close();
?>
