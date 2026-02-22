import pool from "../bdConfig.js";

export class Ingresos {
  /**
   * Crear un nuevo ingreso vinculado a un trámite
   */
  crear = async (datos) => {
    try {
      // Añadimos id_tramite a la desestructuración
      const { id, id_cliente, id_tramite, monto, fecha_ingreso, detalle, usuario, created_at } = datos;
      const sql = `
        INSERT INTO ingresos (id, id_cliente, id_tramite, monto, fecha_ingreso, detalle, usuario, created_at, updated_at)
        VALUES (UUID(), ?, ?,?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(sql, [
        
        id_cliente,
        id_tramite,
        monto,
        fecha_ingreso,
        detalle,
        usuario,
        created_at,
        created_at
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al crear ingreso:", error);
      throw error;
    }
  };


  /**
   * Listar todos los ingresos con nombres de clientes y códigos de trámite
   */
  listarTodos = async () => {
    try {
      const sql = `
        SELECT 
          i.*, 
          CONCAT(c.nombre, ' ', c.ap1, ' ', IFNULL(c.ap2, '')) AS cliente_nombre,
          t.codigo AS codigo_tramite,
          u.nombre AS usuario_nombre
        FROM ingresos i
        INNER JOIN clientes c ON i.id_cliente = c.id
        INNER JOIN tramites t ON i.id_tramite = t.id
        LEFT JOIN usuarios u ON i.usuario = u.id
        
        ORDER BY i.fecha_ingreso DESC
      `;
      const [rows] = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error("Error al listar ingresos:", error);
      throw error;
    }
  };


  /**
   * Listar ingresos vinculados a un trámite específico
   */
  listarPorTramite = async (idTramite) => {
    try {
      const sql = `
        SELECT 
          i.*, 
          t.codigo AS codigo_tramite,
          CONCAT(u.nombre, ' ', u.ap1) AS usuario_nombre
        FROM ingresos i
        INNER JOIN tramites t ON i.id_tramite = t.id
        LEFT JOIN usuarios u ON i.usuario = u.id
        WHERE i.id_tramite = ?
        ORDER BY i.fecha_ingreso DESC
      `;
      const [rows] = await pool.query(sql, [idTramite]);
      return rows;
    } catch (error) {
      console.error("Error al listar ingresos por trámite:", error);
      throw error;
    }
  };

  
  /**
   * Listar ingresos vinculados a un trámite específico
   */
  obtener = async (id) => {
    try {
      const sql = `
        SELECT  * FROM ingresos 
        WHERE id = ?
      `;
      const [rows] = await pool.query(sql, [id]);

      console.log(rows)
      return rows;
    } catch (error) {
      console.error("Error al listar ingresos por trámite:", error);
      throw error;
    }
  };

  /**
   * Actualizar un ingreso (incluyendo posibilidad de reasignar trámite)
   */
  actualizar = async (id, datos) => {
    try {
      const { id_cliente, id_tramite, monto, fecha_ingreso, detalle, updated_at } = datos;
      const sql = `
        UPDATE ingresos 
        SET id_cliente = ?, id_tramite = ?, monto = ?, fecha_ingreso = ?, detalle = ?, updated_at = ?
        WHERE id = ?
      `;
      const [result] = await pool.query(sql, [id_cliente, id_tramite, monto, fecha_ingreso, detalle, updated_at, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al actualizar ingreso:", error);
      throw error;
    }
  };

  /**
   * Eliminar un ingreso
   */
  eliminar = async (id) => {
    try {
      const sql = `DELETE FROM ingresos WHERE id = ?`;
      const [result] = await pool.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al eliminar ingreso:", error);
      throw error;
    }
  };
}