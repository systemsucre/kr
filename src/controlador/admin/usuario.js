import { Router } from "express";
import { Usuario } from "../../modelo/admin/usuario.js";
import {
  insertar,
  actualizar,
  recet,
} from "../../validacion/admin/usuario.js";

const rutas = Router();
const usuarios = new Usuario();

rutas.post("/listar", async (req, res) => {
  try {
    // Definimos valores por defecto: 
    // idExcluir: para no listarse a uno mismo (opcional)
    const idExcluir = req.body.usuario;

    const resultado = await usuarios.listar(idExcluir);

    // Retornamos la estructura que espera tu función 'start' en el frontend
    return res.json({
      data: resultado,
      ok: true
    });

  } catch (error) {
    console.error("Error en ruta listar usuarios:", error);
    return res.status(500).json({
      msg: "Error al obtener la lista de usuarios",
      ok: false,
      error: error.message
    });
  }
});


rutas.post("/listar-roles", async (req, res) => {
  try {
    const resultado = await usuarios.listarRoles();
    // Retornamos la estructura que espera tu función 'start' en el frontend
    return res.json({
      data: resultado,
      ok: true
    });

  } catch (error) {
    console.log(error);
    return res.json({ error: 500, msg: error.sqlMessage });
  }
});


rutas.post("/crear", insertar, async (req, res) => {
  try {
    const {
      id_rol, nombre, ap1, ap2, ci, celular, direccion, username, password, estado
    } = req.body;

    // Mapeamos los campos a la estructura de la base de datos
    const datos = {
      id_rol,
      nombre,
      ap1,
      ap2,
      ci,
      celular,
      direccion,
      username,
      password, // Recuerda encriptar con bcrypt si es necesario
      estado: estado || 1
    };

    const resultado = await usuarios.insertar(datos);

    if (resultado.error === 3) {
      return res.json({ ok: false, msg: "Este C.I. ya se encuentra registrado" });
    }
    if (resultado.error === 4) {
      return res.json({ ok: false, msg: "El nombre de usuario ya existe" });
    }

    return res.json({
      data: resultado,
      ok: true,
      msg: "Usuario registrado correctamente",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: error.sqlMessage || "Error en el servidor" });
  }
});

rutas.post("/editar", actualizar, async (req, res) => {
  try {
    const {
      id, id_rol, usuario, nombre, ap1, ap2, ci, celular, direccion, username, password, estado, fecha_
    } = req.body;

    const datos = {
      id, id_rol, nombre, ap1, ap2, ci, celular, direccion, username, password, estado, usuario, fecha_
    };

    const resultado = await usuarios.actualizar(datos);

    if (resultado.existe === 4)
      return res.json({ ok: false, msg: "El nombre de usuario ya está registrado por otro usuario" });
    if (resultado.existe === 3)
      return res.json({ ok: false, msg: "El C.I. ya está registrado por otro usuario" });
    if (resultado.error === 1)
      return res.json({ ok: false, msg: "No se realizaron cambios o el usuario no existe" });

    return res.json({
      data: resultado,
      ok: true,
      msg: "Usuario actualizado correctamente",
    });

  } catch (error) {
    console.log(error);
    return res.json({ error: 500, msg: error.sqlMessage });
  }
});

rutas.post("/cambiar-estado", async (req, res) => {
  try {
    const { id, estado, usuario, fecha_ } = req.body;

    const datos = { id, estado: estado == 1 ? 1 : 0, usuario, fecha_ };
    const resultado = await usuarios.eliminarLogico(datos);

    if (resultado) {
      const msg = (estado == 1) ? "Usuario activado" : "Usuario desactivado";
      return res.json({ ok: true, msg });
    } else {
      return res.json({ ok: false, msg: "No se pudo cambiar el estado" });
    }
  } catch (error) {
    return res.json({ error: 500, msg: error.sqlMessage });
  }
});

export default rutas;
