import { Router } from "express";
import { registrarAuditoria } from '../../modelo/auditoria.js';
import { Salidas } from "../../modelo/cajero/Salidas.js";

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

export default rutas;