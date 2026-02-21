import { Router } from "express";
import { registrarAuditoria } from '../../modelo/auditoria.js';
import { Salidas } from "../../modelo/gerente/Salidas.js";

const rutas = Router();
const objetoSalida = new Salidas();

/**
 * 1. LISTAR SALIDAS POR TRÁMITE
 */
rutas.post("/listar", async (req, res) => {
  try {
    // Asegúrate de enviar id_tramite desde el front
    const resultado = await objetoSalida.listar(req.body.id);
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

export default rutas;