import { Router } from "express";
import { registrarAuditoria } from '../../modelo/auditoria.js';
import { Tramite } from "../../modelo/admin/Tramite.js";
import { insertar, actualizar } from "../../validacion/admin/tramites.js"; // Importamos las validaciones 

const rutas = Router();
const objetoTramite = new Tramite();


// ENDPOINT: Obtener clientes para el combobox
rutas.post("/listar-clientes", async (req, res) => {
  try {
    const resultado = await objetoTramite.listarClientesActivos();
    return res.json({
      data: resultado,
      ok: true
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error al cargar lista de clientes" });
  }
});

// ENDPOINT: Obtener tipos de trámites para el combobox
rutas.post("/listar-tipo-tramites", async (req, res) => {
  try {
    const resultado = await objetoTramite.listarTiposActivos();
    return res.json({
      data: resultado,
      ok: true
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error al cargar lista de tipos" });
  }
});


// ENDPOINT: Obtener tipos de trámites para el combobox
rutas.post("/obtener", async (req, res) => {
  try {
    const resultado = await objetoTramite.ObtenerTramite(req.body.id);
    return res.json({
      data: resultado,
      ok: true
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error al cargar lista de tipos" });
  }
});


// 1. LISTAR TRÁMITES (Con Joins a Clientes y Tipos)
rutas.post("/listar", async (req, res) => {
  try {
    const resultado = await objetoTramite.listar();
    return res.json({
      data: resultado,
      ok: true
    });
  } catch (error) {
    console.error("Error en ruta listar trámites:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al obtener la lista de trámites"
    });
  }
});

// 2. CREAR TRÁMITE
rutas.post("/crear", insertar, async (req, res) => {
  try {
    const {
      id_cliente, codigo, fecha_ingreso, fecha_finalizacion,
      id_tipo_tramite, detalle, costo, otros, usuario, fecha_
    } = req.body;

    const datos = {
      id_cliente,
      codigo,
      fecha_ingreso,
      fecha_finalizacion,
      id_tipo_tramite,
      detalle,
      costo,
      otros: otros || '',
      estado: 1, // 1: En curso
      usuario,
      created_at: fecha_ // Fecha enviada desde el frontend
    };

    const resultado = await objetoTramite.insertar(datos);

    if (resultado.existe === 1) {
      return res.json({ ok: false, msg: "El código de trámite ya se encuentra registrado" });
    }

    return res.json({
      data: resultado,
      ok: true,
      msg: "Trámite aperturado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.sqlMessage || "Error interno al crear trámite"
    });
  }
});

// 3. EDITAR TRÁMITE
rutas.post("/editar", actualizar, async (req, res) => {
  try {
    const {
      id, id_cliente, codigo, fecha_ingreso, fecha_finalizacion,
      id_tipo_tramite, detalle, costo, otros, estado, usuario, fecha_, datosAuditoriaExtra
    } = req.body;


    const datos = {
      id, id_cliente, codigo, fecha_ingreso, fecha_finalizacion,
      id_tipo_tramite, detalle, costo, otros, estado,
      usuario,
      modified_at: fecha_
    };



    const resultado = await objetoTramite.actualizar(datos);

    if (resultado.error === 1)
      return res.json({ ok: false, msg: "No se encontraron cambios o el trámite no existe" });

    // --- GUARDAR EN AUDITORÍA ---
    // Aquí usamos la info que capturamos arriba
    registrarAuditoria(req, {
      usuario_id: req.body.usuario, // El ID que viene del frontend
      accion: 'UPDATE',
      tabla: 'tramites',
      detalle: datos, // Datos que se enviaron
      datosAuditoriaExtra, fecha:fecha_
    });

    return res.json({
      data: resultado,
      ok: true,
      msg: "Información del trámite actualizada",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: error.sqlMessage });
  }
});

// 4. CAMBIAR ESTADO (EN CURSO / PARALIZADO)
rutas.post("/cambiar-estado", async (req, res) => {
  try {
    const { id, estado, usuario, fecha_, datosAuditoriaExtra } = req.body;

    // console.log(estado)

    // estado == 1 ? "En curso" : "Paralizado"
    const datos = {
      id,
      estado,
      usuario,
      modified_at: fecha_
    };

    const resultado = await objetoTramite.cambiarEstado(datos);

    if (resultado) {
      const msg = (estado == 1) ? "Trámite marcado: En Curso" : "Trámite marcado: Paralizado";

      // --- GUARDAR EN AUDITORÍA ---
      // Aquí usamos la info que capturamos arriba
      registrarAuditoria(req, {
        usuario_id: req.body.usuario, // El ID que viene del frontend
        accion: (estado == 1) ? "Trámite marcado: En Curso" : "Trámite marcado: Paralizado",
        tabla: 'tramites',
        detalle: datos, // Datos que se enviaron
        datosAuditoriaExtra, fecha:fecha_
      });
      return res.json({ ok: true, msg });
    } else {
      return res.json({ ok: false, msg: "No se pudo actualizar el estado del trámite" });
    }
  } catch (error) {
    return res.status(500).json({ ok: false, msg: error.sqlMessage });
  }
});

// 5. ELIMINAR TRÁMITE (Físico)
rutas.post("/eliminar-logica", async (req, res) => {
  try {
    const { id, estado, usuario, fecha_, datosAuditoriaExtra } = req.body;

    const datos = { id, estado: estado == 1 ? 1 : 0, usuario, fecha_ };
    const resultado = await objetoTramite.eliminar(datos);

    if (resultado) {
      const msg = (estado == 1) ? "Tramite activado" : "Tramite eliminado";

      // --- GUARDAR EN AUDITORÍA ---
      // Aquí usamos la info que capturamos arriba
      registrarAuditoria(req, {
        usuario_id: req.body.usuario, // El ID que viene del frontend
        accion: (estado == 1) ? "Tramite activado" : "Tramite eliminado",
        tabla: 'tramites',
        detalle: datos, // Datos que se enviaron
        datosAuditoriaExtra, fecha:fecha_
      });
      return res.json({ ok: true, msg });
    } else {
      return res.json({ ok: false, msg: "No se pudo cambiar el estado del cliente" });
    }
  } catch (error) {
    return res.json({ error: 500, msg: error.sqlMessage });
  }
});

export default rutas;