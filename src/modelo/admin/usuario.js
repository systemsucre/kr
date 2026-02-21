import pool from "../bdConfig.js";

export class Usuario {
  // METODOS




  listar = async (idExcluir = 0) => {
    try {
      const sql = `
        SELECT 
            u.id, 
            u.id_rol, 
            r.rol AS nombre_rol, 
            u.nombre, 
            u.ap1, 
            u.ap2,
            CONCAT(u.nombre, ' ', u.ap1, ' ', IFNULL(u.ap2, '')) AS nombre_completo,
            u.ci, 
            u.celular, 
            u.direccion, 
            u.username,
            u.estado, 
            u.ultimo_acceso,
            u.created_at
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id
        WHERE u.id != ? 
        ORDER BY u.id DESC `;

      // Usamos el formato de arreglos de mysql2 para mayor seguridad (Prepared Statements)
      const [rows] = await pool.query(sql, [idExcluir]);

      return rows;
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      throw error;
    }
  };


  listarRoles = async () => {
    // Usamos 'id as value' para que coincida con lo que espera el Select1
    const sql = `SELECT id as value, rol as label FROM roles ORDER BY rol ASC`;
    const [rows] = await pool.query(sql);


    return rows;
  };


  insertar = async (datos) => {
    // 1. Validar si el C.I. ya existe
    const sqlCi = `SELECT ci FROM usuarios WHERE ci = ${pool.escape(datos.ci)}`;
    const [rowsCi] = await pool.query(sqlCi);

    if (rowsCi.length > 0) {
      return { error: 3 }; // Error de C.I. duplicado
    }

    // 2. Validar si el Username ya existe
    const sqlUser = `SELECT username FROM usuarios WHERE username = ${pool.escape(datos.username)}`;
    const [rowsUser] = await pool.query(sqlUser);

    if (rowsUser.length > 0) {
      return { error: 4 }; // Error de nombre de usuario duplicado
    }

    // 3. Insertar nuevo usuario
    const [result] = await pool.query("INSERT INTO usuarios SET ?", datos);

    // Opcional: retornar el usuario recién creado o una lista actualizada
    return { id: result.insertId, ...datos };
  };


  actualizar = async (datos) => {
    // 1. Validar Username (Que no lo tenga otro ID)
    const sqlUser = `SELECT username FROM usuarios WHERE username = ${pool.escape(datos.username)} AND id != ${pool.escape(datos.id)}`;
    const [rowsUser] = await pool.query(sqlUser);

    if (rowsUser.length > 0) return { existe: 4 };

    // 2. Validar C.I. (Que no lo tenga otro ID)
    const sqlCi = `SELECT ci FROM usuarios WHERE ci = ${pool.escape(datos.ci)} AND id != ${pool.escape(datos.id)}`;
    const [rowsCi] = await pool.query(sqlCi);

    if (rowsCi.length > 0) return { existe: 3 };

    // 3. Construcción dinámica del UPDATE
    let sql = `UPDATE usuarios SET 
                id_rol = ${pool.escape(datos.id_rol)},
                nombre = ${pool.escape(datos.nombre)},
                ap1 = ${pool.escape(datos.ap1)},
                ap2 = ${pool.escape(datos.ap2)},
                ci = ${pool.escape(datos.ci)},
                celular = ${pool.escape(datos.celular)},
                direccion = ${pool.escape(datos.direccion)},
                username = ${pool.escape(datos.username)},
                estado = ${pool.escape(datos.estado)},
                usuario = ${pool.escape(datos.usuario)},
                updated_at = ${pool.escape(datos.fecha_)}`;

    // Solo incluir password si se envió uno nuevo
    if (datos.password && datos.password.trim() !== "") {
      sql += `, password = ${pool.escape(datos.password)}`;
    }

    sql += ` WHERE id = ${pool.escape(datos.id)}`;

    const [res] = await pool.query(sql);

    if (res.affectedRows > 0) {
      // Opcional: Cerrar sesiones activas si el usuario cambió datos sensibles
      // await pool.query("DELETE FROM sesion WHERE usuario_id = ?", [datos.id]);

      // Retornamos la lista actualizada para que el frontend refresque la tabla
      return await this.listar();
    } else {
      return { error: 1 };
    }
  };

  eliminarLogico = async (datos) => {
    // Simplemente cambiamos el estado a 0
    const sql = `UPDATE usuarios SET  estado = ${pool.escape(datos.estado)} , usuario =${pool.escape(datos.usuario)}, updated_at = ${pool.escape(datos.fecha_)}  WHERE id = ${pool.escape(datos.id)}`;
    const [result] = await pool.query(sql);
    if (result.affectedRows > 0) {
      pool.query(`delete from sesion where idusuario = ${pool.escape(datos.id)}`)
      return true
    } else return false
  };



  // metodos, gestionar mi perfil
  cambiarMiContraseña = async (datos) => {
    const sqlExists = `SELECT * FROM medico WHERE 
            contraseña = ${pool.escape(datos.pass1)} 
            and id = ${pool.escape(datos.usuario)}`;
    const [result] = await pool.query(sqlExists);

    if (result.length > 0) {
      const sql = `UPDATE medico SET
                contraseña = ${pool.escape(datos.pass2)}, editing = ${pool.escape(datos.fecha)}, usuario = ${pool.escape(datos.usuario)}
                WHERE id = ${pool.escape(datos.usuario)}`;

      await pool.query(sql);
      return true;
    } else return false;
  };

  actualizarMiPerfil = async (datos) => {
    const sqlexisteCorreo = `SELECT correo from medico where correo = ${pool.escape(datos.correo)} and id != ${pool.escape(datos.usuario)} and correo != 'example@systemsucre.info'`;
    const [result] = await pool.query(sqlexisteCorreo);
    if (result.length === 0) {
      const sql = `UPDATE medico SET
            medico = ${pool.escape(datos.nombre)},
            celular = ${pool.escape(datos.celular)},
            correo = ${pool.escape(datos.correo)},
            editing = ${pool.escape(datos.fecha_)},
            usuario = ${pool.escape(datos.usuario)}
            WHERE id = ${pool.escape(datos.usuario)}`;
      await pool.query(sql);
      return await this.miPerfil(datos.usuario);
    } else return { existe: 1 };
  };

  miPerfil = async (id) => {
    let sqlUser = `select m.id, m.ci, m.medico , m.ci as username,  m.correo, 
                            m.celular, 
                            r.rol as rol, 
                            e.entidad as entidad
                            from medico m
                            left join rol r on r.id = m.rol
                            left join entidad e  on e.id = m.entidad
                            where m.id  = ${pool.escape(id)}`;

    const [result] = await pool.query(sqlUser);
    // console.log(result)

    return result;
  };
}
