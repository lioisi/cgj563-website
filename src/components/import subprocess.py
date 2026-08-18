import subprocess
import socket
import ipaddress
import re
import csv
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime


# ============================================================
# CONFIGURACION
# ============================================================

TIMEOUT_PING_MS = 400
TIMEOUT_PUERTO = 0.5

MAX_WORKERS_PING = 50
MAX_WORKERS_ANALISIS = 20

ARCHIVO_CSV = "dispositivos_red.csv"

# Puerto UDP utilizado para mensajes broadcast
PUERTO_BROADCAST = 50000

PUERTOS_A_REVISAR = {
    22: "SSH",
    53: "DNS",
    80: "HTTP",
    443: "HTTPS",
    502: "MODBUS",
    1883: "MQTT",
    4840: "OPC-UA",
    8080: "HTTP-ALT",
    8883: "MQTTS"
}


# ============================================================
# EJECUCION DE COMANDOS
# ============================================================

def ejecutar_comando(comando):

    try:

        resultado = subprocess.run(
            comando,
            capture_output=True,
            text=True,
            shell=False
        )

        return resultado.stdout

    except Exception:

        return ""


# ============================================================
# CONFIGURACION DE RED WINDOWS
# ============================================================

def obtener_configuracion_red_windows():

    comando = [
        "powershell",
        "-NoProfile",
        "-Command",
        """
        $cfg = Get-NetIPConfiguration |
            Where-Object {
                $_.IPv4Address -ne $null -and
                $_.IPv4DefaultGateway -ne $null
            } |
            Select-Object -First 1;

        if ($cfg) {
            [PSCustomObject]@{
                IP        = $cfg.IPv4Address.IPAddress
                Prefix    = $cfg.IPv4Address.PrefixLength
                Gateway   = $cfg.IPv4DefaultGateway.NextHop
                Interface = $cfg.InterfaceAlias
            } | ConvertTo-Json -Compress
        }
        """
    ]

    resultado = subprocess.run(
        comando,
        capture_output=True,
        text=True
    )

    if resultado.returncode != 0:

        raise RuntimeError(
            "Error consultando configuración de red:\n"
            + resultado.stderr
        )

    salida = resultado.stdout.strip()

    if not salida:

        raise RuntimeError(
            "No se pudo detectar una interfaz IPv4 activa."
        )

    try:

        datos = json.loads(salida)

    except json.JSONDecodeError:

        raise RuntimeError(
            "No se pudo interpretar la respuesta de PowerShell:\n"
            + salida
        )

    ip = datos["IP"]

    prefijo = int(
        datos["Prefix"]
    )

    gateway = datos["Gateway"]

    interfaz = datos.get(
        "Interface",
        ""
    )

    mascara = str(
        ipaddress.IPv4Network(
            f"0.0.0.0/{prefijo}"
        ).netmask
    )

    return {
        "ip": ip,
        "prefijo": prefijo,
        "mascara": mascara,
        "gateway": gateway,
        "interfaz": interfaz
    }


def obtener_red_desde_ip_mascara(
    ip,
    mascara
):

    interfaz = ipaddress.IPv4Interface(
        f"{ip}/{mascara}"
    )

    return interfaz.network


# ============================================================
# PING
# ============================================================

def ping(ip):

    try:

        resultado = subprocess.run(
            [
                "ping",
                "-n",
                "1",
                "-w",
                str(TIMEOUT_PING_MS),
                str(ip)
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        if resultado.returncode == 0:

            return str(ip)

    except Exception:

        pass

    return None


# ============================================================
# HOSTNAME
# ============================================================

def obtener_hostname(ip):

    try:

        return socket.gethostbyaddr(
            ip
        )[0]

    except Exception:

        return ""


# ============================================================
# ARP
# ============================================================

def obtener_tabla_arp():

    return ejecutar_comando(
        ["arp", "-a"]
    )


def normalizar_mac(mac):

    mac = (
        mac
        .strip()
        .lower()
        .replace("-", ":")
    )

    partes = mac.split(":")

    if len(partes) == 6:

        return ":".join(
            p.zfill(2)
            for p in partes
        )

    return mac


def obtener_mac(
    ip,
    tabla_arp
):

    patron = (
        rf"{re.escape(ip)}"
        rf"\s+"
        rf"([0-9a-fA-F:-]+)"
    )

    match = re.search(
        patron,
        tabla_arp
    )

    if match:

        return normalizar_mac(
            match.group(1)
        )

    return "No disponible"


def extraer_ips_arp(
    tabla_arp,
    red
):

    ips = set()

    patron = (
        r"([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)"
        r"\s+"
        r"([0-9a-fA-F:-]+)"
    )

    resultados = re.findall(
        patron,
        tabla_arp
    )

    for ip_txt, mac in resultados:

        try:

            ip_obj = ipaddress.ip_address(
                ip_txt
            )

            if ip_obj in red:

                ips.add(
                    ip_txt
                )

        except ValueError:

            pass

    return ips


# ============================================================
# DETECCION DE PUERTOS
# ============================================================

def puerto_abierto(
    ip,
    puerto
):

    try:

        with socket.create_connection(
            (
                ip,
                puerto
            ),
            timeout=TIMEOUT_PUERTO
        ):

            return True

    except Exception:

        return False


def detectar_servicios(ip):

    abiertos = []

    for puerto, nombre in PUERTOS_A_REVISAR.items():

        if puerto_abierto(
            ip,
            puerto
        ):

            abiertos.append(
                {
                    "puerto": puerto,
                    "servicio": nombre
                }
            )

    return abiertos


# ============================================================
# CLASIFICACION DE DISPOSITIVOS
# ============================================================

def clasificar_dispositivo(
    ip,
    mi_ip,
    gateway,
    hostname,
    servicios
):

    puertos = {
        s["puerto"]
        for s in servicios
    }

    hostname_lower = (
        hostname.lower()
        if hostname
        else ""
    )

    if ip == mi_ip:

        return "ESTA PC"

    if ip == gateway:

        return "ROUTER / GATEWAY"

    if (
        1883 in puertos
        or
        8883 in puertos
    ):

        return "POSIBLE BROKER MQTT / IoT"

    if 502 in puertos:

        return "POSIBLE PLC / MODBUS"

    if 4840 in puertos:

        return "POSIBLE OPC-UA / INDUSTRIAL"

    if (
        "printer" in hostname_lower
        or
        "impresora" in hostname_lower
        or
        "hp" in hostname_lower
        or
        "epson" in hostname_lower
        or
        "brother" in hostname_lower
    ):

        return "POSIBLE IMPRESORA"

    if (
        "camera" in hostname_lower
        or
        "cam" in hostname_lower
        or
        "hikvision" in hostname_lower
        or
        "dahua" in hostname_lower
    ):

        return "POSIBLE CAMARA IP"

    if (
        80 in puertos
        or
        443 in puertos
        or
        8080 in puertos
    ):

        return "DISPOSITIVO WEB / IoT POSIBLE"

    if 22 in puertos:

        return "EQUIPO CON SSH"

    return "NO IDENTIFICADO"


# ============================================================
# ANALISIS DE HOST
# ============================================================

def analizar_dispositivo(
    ip,
    mi_ip,
    gateway,
    tabla_arp
):

    hostname = obtener_hostname(
        ip
    )

    mac = obtener_mac(
        ip,
        tabla_arp
    )

    servicios = detectar_servicios(
        ip
    )

    tipo = clasificar_dispositivo(
        ip,
        mi_ip,
        gateway,
        hostname,
        servicios
    )

    servicios_texto = ", ".join(
        f'{s["servicio"]}:{s["puerto"]}'
        for s in servicios
    )

    if not servicios_texto:

        servicios_texto = "-"

    return {
        "ip": ip,
        "mac": mac,
        "hostname": hostname,
        "servicios": servicios_texto,
        "tipo": tipo,
        "fecha_deteccion":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )
    }


# ============================================================
# EXPORTACION CSV
# ============================================================

def guardar_csv(
    dispositivos,
    archivo
):

    campos = [
        "ip",
        "mac",
        "hostname",
        "servicios",
        "tipo",
        "fecha_deteccion"
    ]

    with open(
        archivo,
        "w",
        newline="",
        encoding="utf-8-sig"
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=campos,
            delimiter=";"
        )

        writer.writeheader()

        for dispositivo in dispositivos:

            writer.writerow(
                dispositivo
            )


# ============================================================
# ENVIO BROADCAST UDP
# ============================================================

def enviar_broadcast(
    red,
    mensaje,
    puerto=PUERTO_BROADCAST
):

    """
    Envía un mensaje UDP al broadcast
    de la red detectada.
    """

    broadcast = str(
        red.broadcast_address
    )

    sock = socket.socket(
        socket.AF_INET,
        socket.SOCK_DGRAM
    )

    sock.setsockopt(
        socket.SOL_SOCKET,
        socket.SO_BROADCAST,
        1
    )

    try:

        sock.sendto(
            mensaje.encode(
                "utf-8"
            ),
            (
                broadcast,
                puerto
            )
        )

        print()
        print(
            "Mensaje enviado correctamente."
        )

        print(
            f"Broadcast : {broadcast}"
        )

        print(
            f"Puerto    : {puerto}"
        )

        print(
            f"Mensaje   : {mensaje}"
        )

    except Exception as e:

        print()
        print(
            f"ERROR enviando broadcast: {e}"
        )

    finally:

        sock.close()


# ============================================================
# PROGRAMA PRINCIPAL
# ============================================================

def main():

    print()
    print("=" * 115)
    print(
        "             INVENTARIO DE DISPOSITIVOS IoT / RED LOCAL"
    )
    print("=" * 115)
    print()

    # --------------------------------------------------------
    # 1. Detectar configuración
    # --------------------------------------------------------

    config = (
        obtener_configuracion_red_windows()
    )

    mi_ip = config["ip"]

    prefijo = config["prefijo"]

    mascara = config["mascara"]

    gateway = config["gateway"]

    interfaz = config["interfaz"]

    red = obtener_red_desde_ip_mascara(
        mi_ip,
        mascara
    )

    broadcast = str(
        red.broadcast_address
    )

    print(
        f"Interfaz          : {interfaz}"
    )

    print(
        f"IP local          : {mi_ip}"
    )

    print(
        f"Máscara           : {mascara}"
    )

    print(
        f"Prefijo           : /{prefijo}"
    )

    print(
        f"Gateway           : {gateway}"
    )

    print(
        f"Red detectada     : {red}"
    )

    print(
        f"Broadcast         : {broadcast}"
    )

    print()

    hosts_posibles = max(
        red.num_addresses - 2,
        0
    )

    print(
        f"Hosts posibles    : {hosts_posibles}"
    )

    print()

    # --------------------------------------------------------
    # 2. PING
    # --------------------------------------------------------

    print(
        "Buscando hosts activos por PING..."
    )

    print()

    encontrados = set()

    with ThreadPoolExecutor(
        max_workers=MAX_WORKERS_PING
    ) as executor:

        futuros = {
            executor.submit(
                ping,
                ip
            ): ip
            for ip in red.hosts()
        }

        for futuro in as_completed(
            futuros
        ):

            try:

                resultado = futuro.result()

                if resultado:

                    encontrados.add(
                        resultado
                    )

            except Exception:

                pass

    print(
        "Hosts que respondieron a PING : "
        f"{len(encontrados)}"
    )

    # --------------------------------------------------------
    # 3. ARP
    # --------------------------------------------------------

    tabla_arp = obtener_tabla_arp()

    ips_arp = extraer_ips_arp(
        tabla_arp,
        red
    )

    encontrados.update(
        ips_arp
    )

    encontrados.add(
        mi_ip
    )

    if gateway:

        encontrados.add(
            gateway
        )

    encontrados = sorted(
        encontrados,
        key=ipaddress.ip_address
    )

    print(
        "Hosts totales PING + ARP       : "
        f"{len(encontrados)}"
    )

    print()

    # --------------------------------------------------------
    # 4. Analizar dispositivos
    # --------------------------------------------------------

    print(
        "Analizando dispositivos..."
    )

    print()

    dispositivos = []

    with ThreadPoolExecutor(
        max_workers=MAX_WORKERS_ANALISIS
    ) as executor:

        futuros = {
            executor.submit(
                analizar_dispositivo,
                ip,
                mi_ip,
                gateway,
                tabla_arp
            ): ip
            for ip in encontrados
        }

        for futuro in as_completed(
            futuros
        ):

            ip = futuros[
                futuro
            ]

            try:

                dispositivo = (
                    futuro.result()
                )

                dispositivos.append(
                    dispositivo
                )

            except Exception as e:

                print(
                    f"Error analizando "
                    f"{ip}: {e}"
                )

    dispositivos = sorted(
        dispositivos,
        key=lambda d:
            ipaddress.ip_address(
                d["ip"]
            )
    )

    # --------------------------------------------------------
    # 5. Mostrar resultados
    # --------------------------------------------------------

    print()

    print(
        f"{'IP':<16}"
        f"{'MAC':<20}"
        f"{'HOSTNAME':<28}"
        f"{'SERVICIOS':<42}"
        f"{'TIPO'}"
    )

    print(
        "-" * 135
    )

    for d in dispositivos:

        hostname = (
            d["hostname"]
            if d["hostname"]
            else "-"
        )

        if len(hostname) > 26:

            hostname = hostname[:26]

        servicios = d[
            "servicios"
        ]

        if len(servicios) > 40:

            servicios = servicios[:40]

        print(
            f"{d['ip']:<16}"
            f"{d['mac']:<20}"
            f"{hostname:<28}"
            f"{servicios:<42}"
            f"{d['tipo']}"
        )

    # --------------------------------------------------------
    # 6. Guardar CSV
    # --------------------------------------------------------

    guardar_csv(
        dispositivos,
        ARCHIVO_CSV
    )

    # --------------------------------------------------------
    # 7. Resumen
    # --------------------------------------------------------

    mqtt_detectados = [
        d
        for d in dispositivos
        if (
            "MQTT:1883"
            in d["servicios"]
            or
            "MQTTS:8883"
            in d["servicios"]
        )
    ]

    modbus_detectados = [
        d
        for d in dispositivos
        if
        "MODBUS:502"
        in d["servicios"]
    ]

    opcua_detectados = [
        d
        for d in dispositivos
        if
        "OPC-UA:4840"
        in d["servicios"]
    ]

    print()

    print(
        "=" * 115
    )

    print(
        "RESUMEN"
    )

    print(
        "=" * 115
    )

    print(
        "Dispositivos detectados : "
        f"{len(dispositivos)}"
    )

    print(
        "MQTT / MQTTS            : "
        f"{len(mqtt_detectados)}"
    )

    print(
        "MODBUS                   : "
        f"{len(modbus_detectados)}"
    )

    print(
        "OPC-UA                   : "
        f"{len(opcua_detectados)}"
    )

    print()

    print(
        "CSV generado             : "
        f"{ARCHIVO_CSV}"
    )

    print(
        "=" * 115
    )

    # ========================================================
    # 8. ENVIAR MENSAJE A LA RED
    # ========================================================

    print()
    print(
        "¿Querés enviar un mensaje UDP "
        "a toda la red?"
    )

    opcion = input(
        "S/N: "
    ).strip().upper()

    if opcion == "S":

        print()

        mensaje = input(
            "Mensaje a enviar: "
        ).strip()

        if mensaje:

            enviar_broadcast(
                red,
                mensaje,
                PUERTO_BROADCAST
            )

        else:

            print(
                "No se ingresó ningún mensaje."
            )

    else:

        print(
            "No se envió ningún mensaje."
        )

    print()
    print(
        "Programa terminado."
    )
    print()


# ============================================================
# INICIO
# ============================================================

if __name__ == "__main__":
    main()