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
    )",

    // 9. TABLA DE PROBLEMAS
    "CREATE TABLE IF NOT EXISTS problemas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        numero INT,
        problema VARCHAR(255) NOT NULL,
        proceso_afectado VARCHAR(150),
        impacto INT CHECK (impacto >= 1 AND impacto <= 5),
        frecuencia INT CHECK (frecuencia >= 1 AND frecuencia <= 5),
        riesgo INT CHECK (riesgo >= 1 AND riesgo <= 5),
        esfuerzo_solucion INT CHECK (esfuerzo_solucion >= 1 AND esfuerzo_solucion <= 5),
        prioridad_calculada DECIMAL(5, 2),
        responsable VARCHAR(100),
        accion_recomendada TEXT,
        estado ENUM('Abierto', 'En análisis', 'Resuelto', 'Pospuesto'),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",

    // 10. TABLA DE INTEGRACIONES (mapa completo)
    "CREATE TABLE IF NOT EXISTS integraciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sistema_origen VARCHAR(150) NOT NULL,
        sistema_destino VARCHAR(150) NOT NULL,
        dato_evento TEXT,
        existe_integracion VARCHAR(100),
        tipo_actual VARCHAR(100),
        tipo_propuesto VARCHAR(100),
        frecuencia VARCHAR(100),
        criticidad ENUM('Baja', 'Media', 'Alta', 'Crítica'),
        observaciones TEXT,
        estado ENUM('Planificada', 'En desarrollo', 'Activa', 'Pausada'),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",

    // 11. TABLA DE MADUREZ DIGITAL
    "CREATE TABLE IF NOT EXISTS madurez_digital (
        id INT PRIMARY KEY AUTO_INCREMENT,
        dimension VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        puntaje_actual INT CHECK (puntaje_actual >= 1 AND puntaje_actual <= 5),
        puntaje_objetivo INT CHECK (puntaje_objetivo >= 1 AND puntaje_objetivo <= 5),
        brecha INT,
        evidencia TEXT,
        accion_recomendada TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",

    // 12. TABLA DE BACKLOG FUNCIONAL
    "CREATE TABLE IF NOT EXISTS backlog_funcional (
        id INT PRIMARY KEY AUTO_INCREMENT,
        epica VARCHAR(100) NOT NULL,
        modulo VARCHAR(100),
        funcionalidad VARCHAR(255) NOT NULL,
        descripcion TEXT,
        prioridad ENUM('Baja', 'Media', 'Alta', 'Crítica'),
        complejidad ENUM('Baja', 'Media', 'Alta', 'Muy Alta'),
        beneficio_esperado TEXT,
        dependencias TEXT,
        estado ENUM('Por hacer', 'En desarrollo', 'En revisión', 'Completado', 'Pospuesto'),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",

    // 13. TABLA DE ROADMAP
    "CREATE TABLE IF NOT EXISTS roadmap (
        id INT PRIMARY KEY AUTO_INCREMENT,
        fase VARCHAR(50) NOT NULL UNIQUE,
        iniciativa VARCHAR(255) NOT NULL,
        duracion_estimada VARCHAR(100),
        objetivo TEXT,
        entregable TEXT,
        impacto VARCHAR(50),
        complejidad ENUM('Baja', 'Media', 'Alta', 'Muy Alta'),
        prioridad ENUM('Baja', 'Media', 'Alta', 'Crítica'),
        estado ENUM('No iniciado', 'En progreso', 'Completado', 'Pausado'),
        fecha_inicio DATE,
        fecha_fin_estimada DATE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

// Insertar problemas
$problemas = array(
    array(1, 'Información dispersa para KPIs', 'Extracción de indicadores', 5, 5, 4, 3, 33.33),
    array(2, 'Carga manual de novedades', 'Liquidación / novedades', 5, 4, 4, 3, 26.67),
    array(3, 'Asignación de recursos poco trazable', 'Operaciones', 4, 4, 4, 3, 21.33),
    array(4, 'Baja adopción por parte de recursos', 'App móvil', 4, 3, 3, 2, 18),
    array(5, 'Integraciones inexistentes o manuales', 'Sistemas', 5, 4, 5, 4, 25)
);

foreach ($problemas as $prob) {
    $sql = "INSERT IGNORE INTO problemas (numero, problema, proceso_afectado, impacto, frecuencia, riesgo, esfuerzo_solucion, prioridad_calculada, estado) 
            VALUES ({$prob[0]}, '{$prob[1]}', '{$prob[2]}', {$prob[3]}, {$prob[4]}, {$prob[5]}, {$prob[6]}, {$prob[7]}, 'Abierto')";
    $conn->query($sql);
}

echo "<p>✅ Problemas insertados: " . count($problemas) . "</p>";

// Insertar madurez digital
$madurez = array(
    array('Procesos', 'Nivel de formalización y estandarización', 2, 4),
    array('Integración', 'Nivel de conexión entre sistemas', 1, 4),
    array('Datos', 'Calidad, disponibilidad y consistencia de datos', 2, 4),
    array('Movilidad', 'Uso de celular por recursos operativos', 1, 4),
    array('BI / KPIs', 'Capacidad de obtener indicadores confiables', 2, 5),
    array('Automatización', 'Procesos con reglas automáticas', 1, 4)
);

foreach ($madurez as $m) {
    $sql = "INSERT IGNORE INTO madurez_digital (dimension, descripcion, puntaje_actual, puntaje_objetivo) 
            VALUES ('{$m[0]}', '{$m[1]}', {$m[2]}, {$m[3]})";
    $conn->query($sql);
}

echo "<p>✅ Madurez Digital insertada: " . count($madurez) . "</p>";

// Insertar backlog funcional
$backlog = array(
    array('App móvil', 'Login seguro', 'Ingreso del recurso a la app con credenciales propias', 'Alta', 'Media'),
    array('App móvil', 'Mis asignaciones', 'Visualización de objetivos, horarios y estado', 'Alta', 'Media'),
    array('App móvil', 'Postulación a servicios', 'Recursos se postulan a objetivos disponibles', 'Alta', 'Alta'),
    array('App móvil', 'Carga de novedades', 'Carga de horas, ausencias, reemplazos e incidentes', 'Alta', 'Alta'),
    array('Operaciones', 'Asignación de recursos', 'Administrar cobertura de objetivos desde plataforma', 'Alta', 'Alta'),
    array('Operaciones', 'Aprobación de novedades', 'Validación antes de enviar a liquidación', 'Alta', 'Media'),
    array('BI', 'Dashboard KPIs', 'Indicadores de cobertura, presentismo, horas, costos', 'Alta', 'Alta'),
    array('Integración', 'Conector liquidación', 'Envío de novedades validadas al sistema de haberes', 'Alta', 'Alta')
);

foreach ($backlog as $item) {
    $sql = "INSERT IGNORE INTO backlog_funcional (epica, funcionalidad, descripcion, prioridad, complejidad, estado) 
            VALUES ('{$item[0]}', '{$item[1]}', '{$item[2]}', '{$item[3]}', '{$item[4]}', 'Por hacer')";
    $conn->query($sql);
}

echo "<p>✅ Backlog Funcional insertado: " . count($backlog) . "</p>";

// Insertar roadmap
$roadmap = array(
    array('Fase 1', 'Diagnóstico y diseño conceptual', '4 a 6 semanas', 'Informe ejecutivo + roadmap'),
    array('Fase 2', 'Dashboard inicial de KPIs', '6 a 8 semanas', 'Tablero ejecutivo MVP'),
    array('Fase 3', 'App móvil MVP', '8 a 12 semanas', 'Aplicación móvil operativa'),
    array('Fase 4', 'Integración con liquidación', '8 a 12 semanas', 'Conector / archivo validado'),
    array('Fase 5', 'Automatización avanzada', '12+ semanas', 'Motor de reglas y alertas')
);

foreach ($roadmap as $rw) {
    $sql = "INSERT IGNORE INTO roadmap (fase, iniciativa, duracion_estimada, entregable, estado) 
            VALUES ('{$rw[0]}', '{$rw[1]}', '{$rw[2]}', '{$rw[3]}', 'No iniciado')";
    $conn->query($sql);
}

echo "<p>✅ Roadmap insertado: " . count($roadmap) . "</p>";

echo "<hr>";
echo "<h2>✅ Base de Datos Lista!</h2>";
echo "<p><strong>Tablas creadas:</strong> $created</p>";
echo "<p><a href='https://cgj563.com'>← Volver al sitio</a></p>";

$conn->close();
?>
