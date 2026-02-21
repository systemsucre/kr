import { Router } from "express";
import { registrarAuditoria } from '../../modelo/auditoria.js';
import { Salidas } from "../../modelo/auxiliar/Salidas.js";
import { Tramite } from "../../modelo/admin/Tramite.js";
import { insertar, actualizar } from "../../validacion/auxiliar/Salidas.js";

const rutas = Router();
const objetoSalida = new Salidas();
const tramite = new Tramite();

/**
 * 1. LISTAR SALIDAS POR TRÁMITE
 */
rutas.post("/listar", async (req, res) => {
  try {
    // Asegúrate de enviar id_tramite desde el front
    const resultado = await objetoSalida.listar(req.body.id, req.body.usuario);
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: "Error al listar salidas" });
  }
});

/**
 * 2. LISTAR TRÁMITES (Para el combobox/selección)
 */
rutas.post("/listar-tramites", async (req, res) => {
  try {
    const resultado = await objetoSalida.listarTramites();
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error al listar trámites" });
  }
});

/**
 * 2. LISTAR TRÁMITES (Para el combobox/selección)
 */
rutas.post("/obtener-tramite", async (req, res) => {
  try {
    const resultado = await objetoSalida.obtenerTramite(req.body.id);
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error al listar trámites" });
  }
});


rutas.post("/obtener-salida", async (req, res) => {
  try {
    const resultado = await objetoSalida.obtenerSalida(req.body.id);
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error al listar trámites" });
  }
});

/**
 * 3. CREAR SALIDA
 */
rutas.post("/crear", insertar, async (req, res) => {
  try {
    const { 
      id_tramite, 
      monto, 
      detalle, 
      usuario, 
      fecha_solicitud, 
      fecha_, 
      datosAuditoriaExtra 
    } = req.body;

    const datos = {
      id_tramite, // UUID del trámite
      monto,
      detalle,
      usuario_solicita_id: usuario,
      fecha_solicitud: fecha_solicitud+' '+fecha_.split(' ')[1] || fecha_, 
      created_at: fecha_
    };

    // Llamada al modelo que valida estado y genera UUID
    const resultado = await objetoSalida.insertar(datos);

    // Validamos el éxito basándonos en la nueva lógica del modelo
    if (!resultado.success) {
      return res.json({ 
        ok: false, 
        msg: resultado.msg || "No se pudo registrar el gasto (Trámite cerrado o inexistente)" 
      });
    }

    // Registro de Auditoría
    registrarAuditoria(req, {
      usuario_id: usuario,
      accion: "CREAR SALIDA",
      tabla: "salidas",
      // Es recomendable registrar el ID del trámite padre en la auditoría
      registro_id: id_tramite, 
      detalle: { ...datos, nuevo_estado: 1 },
      fecha: fecha_,
      datosAuditoriaExtra
    });

    return res.json({ 
      ok: true, 
      msg: "Solicitud de gasto registrada correctamente" 
    });

  } catch (error) {
    console.error("Error en ruta crear salida:", error);
    return res.status(500).json({ 
      ok: false, 
      msg: error.message || "Error interno al crear salida" 
    });
  }
});
/**
 * 4. EDITAR SALIDA
 */
rutas.post("/editar", actualizar, async (req, res) => {
  try {
    const { id, monto, detalle, usuario, fecha_solicitud, fecha_, datosAuditoriaExtra } = req.body;

    const datos = {
      monto,
      detalle,
      fecha_solicitud:fecha_solicitud+' '+fecha_.split(' ')[1] || fecha_, 
      updated_at: fecha_ // Fecha enviada desde el frontend
    };

    // El modelo ahora devuelve un objeto: { success, msg }
    const resultado = await objetoSalida.actualizar(id, datos);

    // Verificamos la propiedad success del objeto retornado
    if (!resultado.success) {
      return res.json({ 
        ok: false, 
        msg: resultado.msg || "No se puede editar: ya fue procesada o no existe" 
      });
    }

    // Si la actualización fue exitosa, registramos auditoría
    registrarAuditoria(req, {
      usuario_id: usuario,
      accion: "UPDATE SALIDA",
      tabla: "salidas",
      registro_id: id, // Es buena práctica guardar el UUID del registro afectado
      detalle: { id, ...datos },
      datosAuditoriaExtra,
      fecha: fecha_
    });

    return res.json({ 
      ok: true, 
      msg: resultado.msg || "Solicitud de gasto actualizada correctamente" 
    });

  } catch (error) {
    console.error("Error en ruta editar salida:", error);
    return res.status(500).json({ 
      ok: false, 
      msg: error.message || "Error interno al actualizar" 
    });
  }
});

/**
 * 5. FLUJO DE ESTADOS (Aprobar, Despachar, Rechazar)
 */

// APROBAR (Estado 2)
rutas.post("/aprobar", async (req, res) => {
  try {
    const { id, usuario, datosAuditoriaExtra, fecha_ } = req.body;
    const resultado = await objetoSalida.cambiarEstado(id, 2, fecha_, usuario);

    if (!resultado) return res.json({ ok: false, msg: "No se pudo aprobar (debe estar Solicitado)" });

    registrarAuditoria(req, {
      usuario_id: usuario, accion: "APROBAR SALIDA", tabla: "salidas",
      detalle: { id }, datosAuditoriaExtra, fecha: fecha_
    });

    return res.json({ ok: true, msg: "Solicitud aprobada correctamente" });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: error.message });
  }
});

// DESPACHAR (Estado 3)
rutas.post("/despachar", async (req, res) => {
  try {
    const { id, usuario, datosAuditoriaExtra, fecha_ } = req.body;
    const resultado = await objetoSalida.cambiarEstado(id, 3, fecha_, usuario);

    if (!resultado) return res.json({ ok: false, msg: "No se pudo despachar (debe estar Aprobado)" });

    registrarAuditoria(req, {
      usuario_id: usuario, accion: "DESPACHAR SALIDA", tabla: "salidas",
      detalle: { id }, datosAuditoriaExtra, fecha: fecha_
    });

    return res.json({ ok: true, msg: "Salida despachada correctamente" });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: error.message });
  }
});

// RECHAZAR (Estado 4)
rutas.post("/rechazar", async (req, res) => {
  try {
    const { id, usuario, datosAuditoriaExtra, fecha_ } = req.body;
    // Usamos cambiarEstado con valor 4
    const resultado = await objetoSalida.cambiarEstado(id, 4, fecha_, usuario);

    if (!resultado) return res.json({ ok: false, msg: "No se pudo rechazar la salida" });

    registrarAuditoria(req, {
      usuario_id: usuario, accion: "RECHAZAR SALIDA", tabla: "salidas",
      detalle: { id }, datosAuditoriaExtra, fecha: fecha_
    });

    return res.json({ ok: true, msg: "Salida rechazada correctamente" });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: error.message });
  }
});

/**
 * 6. ELIMINAR
 */
rutas.post("/eliminar", async (req, res) => {
  try {
    const { id, usuario, datosAuditoriaExtra, fecha_ } = req.body;

    // Llamada al modelo corregido que devuelve { success, msg }
    const resultado = await objetoSalida.eliminar(id);

    // Verificamos la propiedad .success del objeto
    if (!resultado.success) {
      return res.json({ 
        ok: false, 
        msg: resultado.msg || "No se puede eliminar la solicitud" 
      });
    }

    // Si llegó aquí, la eliminación fue exitosa en la DB
    registrarAuditoria(req, {
      usuario_id: usuario,
      accion: "ELIMINAR SALIDA",
      tabla: "salidas",
      registro_id: id, // Guardamos el UUID afectado
      detalle: { id },
      datosAuditoriaExtra,
      fecha: fecha_
    });

    return res.json({ 
      ok: true, 
      msg: resultado.msg || "Registro eliminado correctamente" 
    });

  } catch (error) {
    console.error("Error en ruta eliminar:", error);
    return res.status(500).json({ 
      ok: false, 
      msg: error.message || "Error interno al eliminar" 
    });
  }
});

export default rutas;