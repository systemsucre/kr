import { Router } from "express";
import { registrarAuditoria } from '../../modelo/auditoria.js';
import { Ingresos } from "../../modelo/cajero/ingresos.js"; // Asegúrate de la ruta correcta
import { insertar,actualizar } from "../../validacion/cajero/ingresos.js";

const rutas = Router();
const objetoIngreso = new Ingresos();


/**
 * 1. LISTAR TODOS LOS INGRESOS
 */
rutas.post("/listar-todos", async (req, res) => {
  try {
    const resultado = await objetoIngreso.listarTodos(req.body.id);
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: "Error al listar todos los ingresos" });
  }
});


/**
 * 2. LISTAR INGRESOS POR TRÁMITE
 */
rutas.post("/listar-por-tramites", async (req, res) => {
  try {
    console.log(req.body.id_tramite)
    const { id_tramite } = req.body;
    const resultado = await objetoIngreso.listarPorTramite(id_tramite);
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: "Error al listar ingresos del trámite" });
  }
});


/**
 * 2.1. LISTAR INGRESOS POR TRÁMITE
 */
rutas.post("/obtener", async (req, res) => {
  try {
    const { id } = req.body;
    const resultado = await objetoIngreso.obtener(id);
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: "Error al listar ingresos del trámite" });
  }
});


/**
 * 4. CREAR INGRESO
 */
rutas.post("/crear", insertar, async (req, res) => {
  try {
    const {  id_cliente, id_tramite, monto, fecha_ingreso, detalle, usuario, created_at, datosAuditoriaExtra } = req.body;
    
    const resultado = await objetoIngreso.crear({
      id_cliente, id_tramite, monto, fecha_ingreso, detalle, usuario, created_at
    });

    if (resultado) {
      registrarAuditoria(req, {
        usuario_id: usuario, 
        accion: "CREAR INGRESO", 
        tabla: "ingresos",
        detalle: { id_tramite,monto, detalle }, 
        datosAuditoriaExtra, 
        fecha: created_at
      });
      return res.json({ ok: true, msg: "Ingreso registrado correctamente" });
    }
    
    return res.json({ ok: false, msg: "No se pudo registrar el ingreso" });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: error.message });
  }
});

/**
 * 5. ACTUALIZAR INGRESO
 */
rutas.post("/actualizar", actualizar, async (req, res) => {
  try {
    const { id, id_cliente, id_tramite, monto, fecha_ingreso, detalle, updated_at, usuario, datosAuditoriaExtra } = req.body;
    
    const resultado = await objetoIngreso.actualizar(id, {
      id_cliente, id_tramite, monto, fecha_ingreso, detalle, updated_at
    });

    if (resultado) {
      registrarAuditoria(req, {
        usuario_id: usuario, 
        accion: "ACTUALIZAR INGRESO", 
        tabla: "ingresos",
        detalle: { id, monto, }, 
        datosAuditoriaExtra, 
        fecha: updated_at
      });
      return res.json({ ok: true, msg: "Ingreso actualizado correctamente" });
    }

    return res.json({ ok: false, msg: "No se pudo actualizar el ingreso" });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: error.message });
  }
});

/**
 * 6. ELIMINAR INGRESO
 */
rutas.post("/eliminar", async (req, res) => {
  try {
    const { id, usuario, fecha_, datosAuditoriaExtra } = req.body;
    const resultado = await objetoIngreso.eliminar(id);

    if (resultado) {
      registrarAuditoria(req, {
        usuario_id: usuario, 
        accion: "ELIMINAR INGRESO", 
        tabla: "ingresos",
        detalle: { id }, 
        datosAuditoriaExtra, 
        fecha: fecha_
      });
      return res.json({ ok: true, msg: "Ingreso eliminado correctamente" });
    }

    return res.json({ ok: false, msg: "No se pudo eliminar el ingreso" });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: error.message });
  }
});

export default rutas;