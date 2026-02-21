import pool from "../bdConfig.js";

export class TipoTramite {
  
  /**
   * Lista todos los trámites con datos de auditoría básica
   */
  listar = async () => {
    try {
      const sql = `
        SELECT 
            id, 
            tipo_tramite, 
            estado, 
            usuario, 
            created_at, 
            updated_at 
        FROM tipo_tramites 
        ORDER BY id DESC`;
      const [rows] = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error("Error al listar tipos de trámites:", error);
      throw error;
    }
  };

  /**
   * Registro de nuevo trámite con auditoría
   * @param {Object} datos - { tipo_tramite, usuario, created_at }
   */
  insertar = async (datos) => {
    try {
      // 1. Validar duplicados
      const sqlCheck = `SELECT id FROM tipo_tramites WHERE tipo_tramite = ${pool.escape(datos.tipo_tramite)}`;
      const [rows] = await pool.query(sqlCheck);

      if (rows.length > 0) return { existe: 1 };

      // 2. Insertar usando el objeto directo (mysql2 mapea las columnas)
      const [result] = await pool.query("INSERT INTO tipo_tramites SET ?", datos);
      
      return { id: result.insertId, ...datos };
    } catch (error) {
      console.error("Error al insertar trámite:", error);
      throw error;
    }
  };

  /**
   * Actualización con seguimiento de cambios
   * @param {Object} datos - { id, tipo_tramite, usuario, updated_at }
   */
  actualizar = async (datos) => {
    try {
      // Validar que el nombre no lo tenga otro registro
      const sqlCheck = `SELECT id FROM tipo_tramites 
                        WHERE tipo_tramite = ${pool.escape(datos.tipo_tramite)} 
                        AND id != ${pool.escape(datos.id)}`;
      const [rows] = await pool.query(sqlCheck);

      if (rows.length > 0) return { existe: 1 };

      const sql = `UPDATE tipo_tramites SET 
                   tipo_tramite = ${pool.escape(datos.tipo_tramite)},
                   usuario = ${pool.escape(datos.usuario)},
                   updated_at = ${pool.escape(datos.updated_at)}
                   WHERE id = ${pool.escape(datos.id)}`;

      const [res] = await pool.query(sql);

      return res.affectedRows > 0 ? await this.listar() : { error: 1 };
    } catch (error) {
      console.error("Error al actualizar trámite:", error);
      throw error;
    }
  };

  /**
   * Eliminación Lógica (Activar/Desactivar)
   * @param {Object} datos - { id, estado, usuario, updated_at }
   */
  eliminarLogico = async (datos) => {
    try {
      const sql = `UPDATE tipo_tramites SET 
                   estado = ${pool.escape(datos.estado)},
                   usuario = ${pool.escape(datos.usuario)},
                   updated_at = ${pool.escape(datos.updated_at)}
                   WHERE id = ${pool.escape(datos.id)}`;
      
      const [result] = await pool.query(sql);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en cambio de estado:", error);
      throw error;
    }
  };
}