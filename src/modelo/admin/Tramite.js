import pool from "../bdConfig.js";

export class Tramite {

  /**
   * Lista todos los trámites con los nombres de clientes y tipos de trámite (INNER JOIN)
   */
  listar = async () => {
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
      return rows;
    } catch (error) {
      console.error("Error al listar trámites:", error);
      throw error;
    }
  };


  ObtenerTramite = async (id) => {
    try {
      const sql = `
      SELECT 
          t.id, 
          t.codigo, 
          t.fecha_ingreso, 
          t.fecha_finalizacion, 
          t.detalle, 
          t.costo, 
          t.otros, 
          t.estado, 
          t.id_cliente,
          t.id_tipo_tramite,
          CONCAT(c.nombre, ' ', c.ap1, ' ', IFNULL(c.ap2, '')) AS cliente_nombre,
          tt.tipo_tramite AS nombre_tipo_tramite
      FROM tramites t
      INNER JOIN clientes c ON t.id_cliente = c.id
      INNER JOIN tipo_tramites tt ON t.id_tipo_tramite = tt.id
      WHERE t.id = ?`; // Filtramos por el ID recibido

      const [rows] = await pool.query(sql, [id]);

      // Retornamos solo el objeto encontrado, no la lista completa
      return rows.length > 0 ? rows[0] : null;

    } catch (error) {
      console.error("Error al obtener el trámite por ID:", error);
      throw error;
    }
  };


  /**
   * Obtiene lista simplificada de clientes activos para selects
   */
  listarClientesActivos = async () => {
    try {
      const sql = `
      SELECT id as value, CONCAT(nombre, ' ', ap1, ' ', IFNULL(ap2, '')) as label 
      FROM clientes 
      WHERE estado = 1 
      ORDER BY nombre ASC`;
      const [rows] = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error("Error al listar clientes auxiliares:", error);
      throw error;
    }
  };

  /**
   * Obtiene lista simplificada de tipos de trámites activos para selects
   */
  listarTiposActivos = async () => {
    try {
      const sql = `SELECT id as value, tipo_tramite as label FROM tipo_tramites WHERE estado = 1 ORDER BY tipo_tramite ASC`;
      const [rows] = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error("Error al listar tipos auxiliares:", error);
      throw error;
    }
  };

  /**
   * Registro de un nuevo trámite
   * @param {Object} datos - Incluye id_cliente, codigo, fechas, id_tipo_tramite, costo, etc.
   */
  // Dentro de tu clase Tramites
  insertar = async (datos) => {
    try {
      // 1. Verificar si el código ya existe
      const [existe] = await pool.query(
        "SELECT COUNT(*) as total FROM tramites WHERE codigo = ? AND eliminado = 1",
        [datos.codigo]
      );

      if (existe[0].total > 0) {
        return { existe: 1 };
      }

      // 2. Insertar con UUID generado por MySQL
      const sql = `
      INSERT INTO tramites (
        id, id_cliente, codigo, fecha_ingreso, fecha_finalizacion, 
        id_tipo_tramite, detalle, costo, otros, estado, 
        usuario, created_at, eliminado
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

      const valores = [
        datos.id_cliente,
        datos.codigo,
        datos.fecha_ingreso,
        datos.fecha_finalizacion,
        datos.id_tipo_tramite,
        datos.detalle,
        datos.costo,
        datos.otros,
        datos.estado,
        datos.usuario, // id del usuario que crea
        datos.created_at || new Date()
      ];

      const [result] = await pool.query(sql, valores);

      // 3. (Opcional) Obtener el ID recién creado si necesitas devolverlo
      // Como MySQL genera el UUID internamente, result.insertId no servirá (es para autoincrementales)
      return {
        affectedRows: result.affectedRows,
        codigo: datos.codigo,
        status: "success"
      };

    } catch (error) {
      console.error("Error en modelo Tramites:", error);
      throw error;
    }
  };

  /**
   * Actualización de un trámite existente
   */
  actualizar = async (datos) => {
    try {
      const sql = `UPDATE tramites SET 
                   id_cliente = ${pool.escape(datos.id_cliente)},
                   codigo = ${pool.escape(datos.codigo)},
                   fecha_ingreso = ${pool.escape(datos.fecha_ingreso)},
                   fecha_finalizacion = ${pool.escape(datos.fecha_finalizacion)},
                   id_tipo_tramite = ${pool.escape(datos.id_tipo_tramite)},
                   detalle = ${pool.escape(datos.detalle)},
                   costo = ${pool.escape(datos.costo)},
                   otros = ${pool.escape(datos.otros)},
                   estado = ${pool.escape(datos.estado)},
                   usuario = ${pool.escape(datos.usuario)},
                   modified_at = ${pool.escape(datos.modified_at)}
                   WHERE id = ${pool.escape(datos.id)}`;

      const [res] = await pool.query(sql);
      return res.affectedRows > 0 ? { ok: true } : { error: 1 };
    } catch (error) {
      console.error("Error al actualizar trámite:", error);
      throw error;
    }
  };

  /**
   * Cambiar estado del trámite (En curso / Paralizado)
   * @param {Object} datos - { id, estado, usuario, modified_at }
   */
  cambiarEstado = async (datos) => {
    try {
      const sql = `UPDATE tramites SET 
                   estado = ${pool.escape(datos.estado)},
                   usuario = ${pool.escape(datos.usuario)},
                   modified_at = ${pool.escape(datos.modified_at)}
                   WHERE id = ${pool.escape(datos.id)}`;

      const [result] = await pool.query(sql);
      // console.log(sql)
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al cambiar estado del trámite:", error);
      throw error;
    }
  };

  /**
   * Eliminar logico
   */
  eliminar = async (datos) => {
    try {
      // Cambiamos DELETE por UPDATE
      // Asumimos que estado = 1 es ACTIVO y estado = 0 es ELIMINADO/INACTIVO
      const sql = `UPDATE tramites SET 
                eliminado = ${pool.escape(datos.estado)}, 
                usuario = ${pool.escape(datos.usuario)}, 
                modified_at = ${pool.escape(datos.fecha_)} 
                WHERE id = ${pool.escape(datos.id)}`;

      const [result] = await pool.query(sql);

      // Retornamos true si se encontró el registro y se modificó
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al realizar eliminación lógica del trámite:", error);
      throw error;
    }
  };
}