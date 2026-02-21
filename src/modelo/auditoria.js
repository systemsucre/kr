import pool from '../modelo/bdConfig.js'; // Tu conexión a la base de datos
import useragent from 'useragent';
import geoip from 'geoip-lite';

/**
 * Registra un evento en la tabla de auditorías
 * @param {Object} req - Objeto request de Express para capturar IP y User-Agent
 * @param {Object} params - Datos de la auditoría { usuario_id, tabla, accion, detalle }
 */
export const registrarAuditoria = async (req, { usuario_id, tabla, accion, detalle, fecha, datosAuditoriaExtra }) => {
    try {
        const agent = useragent.parse(req.headers['user-agent']);
        //1. 
        // Manejo de IP (soporta proxies como Nginx)
        let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
        if (ip.includes('::1')) ip = '127.0.0.1';

        // Geolocalización
        const geo = geoip.lookup(ip);

        const metadata = {
            // --- Info de Dispositivo ---
            navegador: agent.family,
            version: agent.toVersion(),
            os: agent.os.toString(),
            dispositivo: agent.device.family,

            // --- Info de Red y Ubicación ---
            ip: ip,
            pais: geo ? geo.country : 'Desconocido',
            ciudad: geo ? geo.city : 'Desconocido',
            timezone: geo ? geo.timezone : 'UTC',
            coords: geo ? geo.ll : null, // [lat, lon]

            // --- Contexto de Navegación ---
            url_peticion: req.originalUrl,
            metodo: req.method,
            origen: req.headers['referer'] || 'Acceso Directo',
            idioma: req.headers['accept-language']?.split(',')[0] || 'Desconocido',

            // --- Info del Frontend (si la envías en el body) ---
            resolucion: datosAuditoriaExtra.screen_size,
            vistas_previas: datosAuditoriaExtra.vistas_previas,
            user_timezone: datosAuditoriaExtra.user_timezone
        };

        //     Tips Adicionales:
        // Proxy/Heroku/Vercel: Si tu servidor está detrás de un proxy (como Nginx), usa req.headers['x-forwarded-for'] para obtener la IP real del cliente en lugar de la del proxy.

        // Sin librerías: Si no quieres instalar useragent, puedes usar simplemente req.headers['user-agent'], pero obtendrás un texto largo y complejo como: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...".



        // 2. Preparar el SQL
        const sql = `
            INSERT INTO auditorias (usuario_id, tabla, accion, detalle, metadata, fecha)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // 3. Ejecutar inserción
        // Recordar que detalle y metadata deben ser strings JSON para MySQL
        await pool.query(sql, [
            usuario_id,
            tabla,
            accion, 
            JSON.stringify(detalle),
            JSON.stringify(metadata), 
            fecha
        ]);

        return true;
    } catch (error) {
        console.error("CRITICAL ERROR en AuditoriaHelper:", error);
        // No lanzamos el error para que la operación principal (ej. editar trámite)
        // no se detenga si la auditoría falla.
        return false;
    }
};