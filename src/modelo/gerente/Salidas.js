import pool from "../bdConfig.js";

export class Salidas {

  /**
   * Lista trámites con nombres de clientes para el select/modal de creación
   */
  listarTramites = async () => {

    try {
 const sql = `
      SELECT 
        t.id, 
        t.codigo, 
        t.detalle, 
        t.costo,
        CONCAT(c.nombre, ' ', c.ap1, ' ', IFNULL(c.ap2, '')) AS cliente_nombre, 
        t.estado, 
        t.eliminado, 
        t.fecha_ingreso, 
        t.fecha_finalizacion,
        tt.tipo_tramite AS nombre_tipo_tramite,
        /* Sumamos los montos de las salidas, si es NULL ponemos 0 */
        IFNULL(SUM(s.monto), 0) AS total_gastos,
        /* Calculamos la utilidad o saldo restante si lo necesitas */
        (t.costo - IFNULL(SUM(s.monto), 0)) AS saldoDisponible
      FROM tramites t
      INNER JOIN clientes c ON t.id_cliente = c.id
      INNER JOIN tipo_tramites tt ON t.id_tipo_tramite = tt.id
      /* Unimos con salidas filtrando solo las que NO estén rechazadas (suponiendo estado 4 es rechazado) */
      LEFT JOIN salidas s ON t.id = s.id_tramite AND s.estado = 3
      WHERE t.eliminado = 1
      GROUP BY t.id
      ORDER BY t.id DESC`;
      const [rows] = await pool.query(sql);
      // console.log(rows, '   tramites')

      return rows;
    } catch (error) {
      console.error("Error al listar trámites:", error);
      throw error;
    }
  };

  /**
 * TRAMITE PARA VISTA PREVIA CREAR GASTO
 */
  obtenerTramite = async (id) => {


    try {
      const sql = `
          SELECT 
            t.id, 
            t.codigo, 
            CONCAT(c.nombre, ' ', c.ap1, ' ', IFNULL(c.ap2, '')) AS cliente_nombre, 
            t.estado, 
            t.fecha_ingreso, 
            t.costo,
            tt.tipo_tramite AS nombre_tipo_tramite, 
            -- Si no hay salidas, devolvemos 0 en lugar de NULL
            IFNULL(SUM(s.monto), 0) AS montoAcumulado,
            -- Calculamos el saldo disponible directamente
            (t.costo - IFNULL(SUM(s.monto), 0)) AS saldoDisponible
            FROM tramites t
            INNER JOIN clientes c ON t.id_cliente = c.id
            INNER JOIN tipo_tramites tt ON t.id_tipo_tramite = tt.id
            -- LEFT JOIN para no perder trámites sin gastos
            LEFT JOIN salidas s ON t.id = s.id_tramite AND s.estado < 4
            WHERE t.id = ${pool.escape(id)}
            GROUP BY t.id;
        `;
      const [rows] = await pool.query(sql);
      // console.log(rows, '   tramites unico')

      return rows;
    } catch (error) {
      console.error("Error al listar trámites:", error);
      throw error;
    }
  };

  obtenerSalida = async (id) => {
    try {
      const sql = `
       SELECT s.*, t.codigo AS codigo_tramite, concat(u.nombre ,' ', u.ap1) as usuario_nombre
        FROM salidas s
        INNER JOIN tramites t ON s.id_tramite = t.id
        inner join usuarios u on u.id = s.usuario_solicita_id
        WHERE s.id = ${pool.escape(id)}`;
      const [rows] = await pool.query(sql);
      // console.log(rows, '   tramites')

      return rows;
    } catch (error) {
      console.error("Error al listar trámites:", error);
      throw error;
    }
  };

  /**
   * Listar salidas de un trámite específico
   */
  listar = async (id) => {
    try {
      const sql = `
        SELECT s.*, t.codigo AS codigo_tramite, concat(u.nombre ,' ', u.ap1) as usuario_nombre
        FROM salidas s
        INNER JOIN tramites t ON s.id_tramite = t.id
        inner join usuarios u on u.id = s.usuario_solicita_id
        where id_tramite = ${pool.escape(id)}
        ORDER BY s.numero DESC
      `;
      const [rows] = await pool.query(sql);

      // console.error("Error al listar salidas:", rows,  id);

      return rows;
    } catch (error) {
      console.error("Error al listar salidas:", error);
      throw error;
    }
  };




  /**
   * Lógica de flujo de estados
   */
  cambiarEstado = async (id, nuevoEstado, fecha, usuarioId) => {
    try {
      let sql = "";
      let parametros = [];
      const fechaActual = fecha;

      switch (Number(nuevoEstado)) {
        case 2: // APROBAR
          sql = `UPDATE salidas SET estado = 2, usuario_aprueba_id = ?, fecha_aprobacion = ? WHERE id = ? AND estado = 1`;
          parametros = [usuarioId, fechaActual, id];
          break;
        case 3: // DESPACHAR
          sql = `UPDATE salidas SET estado = 3, usuario_despacha_id = ?, fecha_despacho = ? WHERE id = ? AND estado = 2`;
          parametros = [usuarioId, fechaActual, id];
          break;
        case 4: // RECHAZAR
          sql = `UPDATE salidas SET estado = 4 WHERE id = ? AND estado < 3`;
          parametros = [id];
          break;
        default:
          throw new Error("Estado no válido para esta operación");
      }

      const [result] = await pool.query(sql, parametros);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      throw error;
    }
  };

}