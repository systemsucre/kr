import { Router } from "express";
import { Registro } from "../modelo/registro.js";
import { insertar, modificar, } from "../validacion/registro.js";


const rutas = Router();
const registro = new Registro();

rutas.post("/examen", async (req, res) => {
  try {
    const resultado = await registro.listar();
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    console.log(error);
    return res.json({ ok: false, msg: "Error en el servidor" });
  }
});

rutas.post("/listar-datos-edicion", async (req, res) => {
  // console.log(req.body)
  try {
    const { consulta, paciente, usuario, } = req.body
    const resultado = await registro.listarDatosEdicion({ consulta, paciente, usuario }); 
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    console.log(error);
    return res.json({ ok: false, msg: "Error en el servidor" });
  }
});

rutas.post("/listar-consultas", async (req, res) => {
  try {
    const resultado = await registro.listarConsultas(req.body.id);
    if (!resultado) return res.json({ ok: 404, msg: "Paciente no encontrado" });

    return res.json({ data: resultado, ok: true });
  } catch (error) {
    console.log(error);
    return res.json({ ok: false, msg: "Error en el servidor" });
  }
});


rutas.post("/listar-datos-pdf", async (req, res) => { 
  // console.log(req.body, ' llamando fun ')
  try {
    const { consulta, paciente, usuario, sidentidad, nombreusuarioS, servicioS, fecha_, usernameS, } = req.body

    const resultado = await registro.listarTodosLosDatos(consulta, paciente, usuario, sidentidad);
    if (!resultado) return res.json({ ok: 404, msg: "Paciente no encontrado" });
    // resultado[1][0].entidad = sentidad
    // resultado[1][0].personal = nombreusuarioS
    // resultado[1][0].servicio = servicioS
    resultado[1][0].emision = fecha_
    resultado[1][0].usuario = nombreusuarioS
    return res.json({ data: resultado, ok: true });
  } catch (error) {
    console.log(error);
    return res.json({ ok: false, msg: "Error en el servidor" });
  }
});







rutas.post("/registrar", insertar, async (req, res) => {
  // console.log("datos: ", req.body);
  const {
    paciente, consulta, diagnostico, tratamiento, examen, desExamenFisico, img, fecha_, usuario
  } = req.body;
  const datos = {
    paciente, consulta, diagnostico, conducta: tratamiento, examen, img, fecha: fecha_, usuario, examenfisico: desExamenFisico,
  };
  try {
    if (paciente) {
      const resultado = await registro.insertar(datos);

      if (!resultado)
        return res.json({
          ok: false,
          msg: "Fallo al registrar",
        });

      else
        return res.json({
          data: resultado,
          ok: true,
          msg: " Historia clínica registrado correctamente",
        });
    }
    else return res.json({ ok: false, msg: " Paciente no encontrado" });
  } catch (error) {
    console.log(error);
    return res.json({ msg: "Error en el Servidor", ok: false });
  }
});


rutas.post("/modificar", modificar, async (req, res) => {
  // console.log("datos: ", req.body);
  const {
    paciente, idconsulta, consulta, diagnostico, tratamiento, desExamenFisico, examen, img, fecha_, usuario,
  } = req.body;
  const datos = {
    paciente, id: idconsulta, consulta, diagnostico, conducta: tratamiento, examen, img, fecha: fecha_, usuario, examenfisico: desExamenFisico,
  };
  try {
    if (paciente) {
      const resultado = await registro.modificar(datos);

      if (!resultado)
        return res.json({
          ok: false,
          msg: "Fallo al Actualizar registro",
        });

      else
        return res.json({
          ok: true,
          msg: " Consulta modificado correctamente",
        });
    }
    else return res.json({ ok: false, msg: " Paciente no encontrado" });
  } catch (error) {
    console.log(error);
    return res.json({ msg: "Error en el Servidor", ok: false });
  }
});

rutas.post("/eliminar", async (req, res) => {
  console.log("datos: ", req.body);
  const {
    paciente, id, fecha_, usuario,
  } = req.body;
  const datos = {
    id, fecha: fecha_, usuario
  };
  try {
    if (paciente) {
      const resultado = await registro.eliminar(datos);

      if (!resultado)
        return res.json({
          ok: false,
          msg: "Registro no eliminado",
        });

      else
        return res.json({
          ok: true,
          msg: " Registro eliminado correctamente",
        });
    }
    else return res.json({ ok: false, msg: " Paciente no encontrado" });
  } catch (error) {
    console.log(error);
    return res.json({ msg: "Error en el Servidor", ok: false });
  }
});




export default rutas;
