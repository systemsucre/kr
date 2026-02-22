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
      LEFT JOIN salidas s ON t.id = s.id_tramite AND s.estado <> 4
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
  listar = async (id_tramite, usuario) => {
    try {
      const sql = `
        SELECT s.*, t.codigo AS codigo_tramite, concat(u.nombre ,' ', u.ap1) as usuario_nombre
        FROM salidas s
        INNER JOIN tramites t ON s.id_tramite = t.id
        inner join usuarios u on u.id = s.usuario_solicita_id
        WHERE s.id_tramite = ? and s.usuario_solicita_id = ?
        ORDER BY s.numero DESC
      `;
      const [rows] = await pool.query(sql, [id_tramite, usuario]);
      return rows;
    } catch (error) {
      console.error("Error al listar salidas:", error);
      throw error;
    }
  };


  /**
   * Insertar nueva salida (Estado 1 por defecto)
   */
  insertar = async (datos) => {
    try {
      // 1. Verificamos la existencia y estado del trámite
      let numero = 1; // Valor por defecto
      const [ultRow] = await pool.query(`SELECT MAX(numero) AS maximo FROM salidas where id_tramite = ${pool.escape(datos.id_tramite)} `);

      // Si hay registros, el resultado no será null. 
      // Sumamos 1 para el siguiente correlativo.
      if (ultRow.length > 0 && ultRow[0].maximo !== null) {
        numero = ultRow[0].maximo + 1;
      } else {
        numero = 1;
      }

      const tramite = await this.obtenerTramite(datos.id_tramite);

      if (tramite && tramite.length > 0 && tramite[0].estado === 1) {
        // 2. Generamos el UUID en la consulta o mediante código
        const sql = `
                INSERT INTO salidas 
                (id, numero, id_tramite, monto, detalle, usuario_solicita_id, fecha_solicitud, created_at, estado)
                VALUES (UUID(),?, ?, ?, ?, ?, ?, ?, 1) 
            `;

        const valores = [
          numero,
          datos.id_tramite,
          datos.monto,
          datos.detalle,
          datos.usuario_solicita_id,
          datos.fecha_solicitud,
          datos.fecha_solicitud

        ];

        const [result] = await pool.query(sql, valores);

        // IMPORTANTE: Al ser UUID, result.insertId es 0. 
        // Retornamos affectedRows para confirmar éxito.
        return {
          success: result.affectedRows > 0,
          ...datos,
          msg: "Gasto registrado con éxito"
        };
      } else {
        // Trámite no apto para nuevos gastos (finalizado o no existe)
        return { success: false, estado_tramite: 0, msg: "El trámite no está vigente o no existe" };
      }
    } catch (error) {
      console.error("Error al insertar salida:", error);
      throw error;
    }
  };

  /**
   * Actualizar salida (Solo si está en estado Solicitado o Rechazado)
   */
  actualizar = async (id_salida, datos) => {
    try {
      // 1. Primero obtenemos la salida para saber a qué trámite pertenece
      const [salidaActual] = await pool.query(
        "SELECT id_tramite FROM salidas WHERE id = ?",
        [id_salida]
      );

      if (salidaActual.length === 0) return { success: false, msg: "La salida no existe" };

      const id_tramite = salidaActual[0].id_tramite;

      // 2. Ahora validamos el estado del Trámite
      // console.log(id_tramite)
      const tramite = await this.obtenerTramite(id_tramite);

      if (!tramite || tramite.length === 0) return { success: false, msg: "Trámite no encontrado" };

      // VALIDACIÓN LÓGICA: Solo permitir si el trámite está Activo (estado 1)
      if (tramite[0].estado !== 1) {
        return { success: false, msg: "No se puede editar: El trámite ya no está activo" };
      }

      // 3. Procedemos a la actualización
      const sql = `
        UPDATE salidas SET
          monto = ?, 
          detalle = ?, 
          fecha_solicitud = ?, 
          updated_at = ?
        WHERE id = ? AND estado = 1
    `;

      const [result] = await pool.query(sql, [
        datos.monto,
        datos.detalle,
        datos.fecha_solicitud,
        datos.updated_at,
        id_salida // UUID de la salida
      ]);

      return {
        success: result.affectedRows > 0,
        msg: result.affectedRows > 0 ? "Actualizado correctamente" : "No se pudo actualizar (posiblemente ya fue despachada)"
      };

    } catch (error) {
      console.error("Error al actualizar salida:", error);
      throw error;
    }
  };

  /**
   * Lógica de flujo de estados
   */
  cambiarEstado = async (id, nuevoEstado, usuarioId) => {
    try {
      let sql = "";
      let parametros = [];
      const fechaActual = new Date();

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
          sql = `UPDATE salidas SET estado = 4 WHERE id = ? AND estado = 1`;
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

  eliminar = async (id) => { // 'id' es el UUID de la salida
    try {
      // 1. Buscamos a qué trámite pertenece esta salida
      // CORRECCIÓN: Cambiado 'id_salida' por 'id'
      const [salidaActual] = await pool.query(
        "SELECT id_tramite FROM salidas WHERE id = ?",
        [id]
      );

      if (salidaActual.length === 0) {
        return { success: false, msg: "La salida no existe" };
      }

      const id_tramite = salidaActual[0].id_tramite;

      // 2. Verificamos el estado del trámite usando 'this.'
      const tramite = await this.obtenerTramite(id_tramite);

      if (tramite && tramite.length > 0 && tramite[0].estado === 1) {
        // 3. Eliminamos solo si está en estado 1 (Solicitado) o 4 (Rechazado)
        const sql = `DELETE FROM salidas WHERE id = ? AND (estado = 1 OR estado = 4)`;
        const [result] = await pool.query(sql, [id]);

        if (result.affectedRows > 0) {
          return { success: true, msg: "Salida eliminada correctamente" };
        } else {
          return {
            success: false,
            msg: "No se pudo eliminar: El gasto ya fue aprobado o despachado"
          };
        }
      } else {
        return {
          success: false,
          msg: "No se puede eliminar: El trámite ya está finalizado o no existe"
        };
      }
    } catch (error) {
      console.error("Error al eliminar salida:", error);
      throw error;
    }
  };
}