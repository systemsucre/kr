import express from "express";
import pool from "../modelo/bdConfig.js";
import { KEY } from "../config.js";

import jwt from "jsonwebtoken";

import {
  getTime,
  getDate,
} from "util-tiempo";



// MI PERFIL
import miPerfil from "../controlador/miPerfil.js";

// Admiministrador
import usuario from "../controlador/admin/usuario.js";
import clientes from "../controlador/admin/clientes.js";
import tipoTramite from "../controlador/admin/tipoTramites.js";
import Tramite from "../controlador/admin/Tramites.js";

//Auxiliar
import salidas from "../controlador/auxiliar/Salidas.js";

// GERENTE
import SalidasGerente from '../controlador/gerente/Salidas.js'


// CAJERO
import SalidaCajero from '../controlador/cajero/Salidas.js'
import IngresosCajero from '../controlador/cajero/ingresos.js'

// import { createOrder, recivedWebhook } from "../controlador/controller/payment.controller.js";



const rutas = express();

// +*********************************************************** login ****************************************

// ruta de autentidicacion
rutas.get("/", async (req, res) => {
  try {
    // console.log(req.query.viva)
    const sql = `SELECT 
          u.id,
          u.celular,
          u.nombre, u.ap1,
          
          UPPER(r.rol) as rol, 
          r.id as idrol, 
          u.username
          from usuarios u 
   
          inner join roles r on u.id_rol = r.id
          where u.username = ${pool.escape(req.query.intel)} and u.password = ${pool.escape(req.query.viva)} and u.estado = true`;
    const [result] = await pool.query(sql);
    // console.log(result, 'iniciio de sesion', req.query.intel, req.query.viva)
    if (result.length === 1) {
      const payload = {
        usuario: result[0].ci,

        name: result[0].nombre,
        servicio: result[0].celular,
        fecha: new Date(),
      };
      const token = jwt.sign(payload, KEY, {
        expiresIn: "3d",
      });

      const idusuario = result[0].id;
      let fecha = getDate({ timeZone: "America/La_Paz", })
      const datos = {
        idusuario,
        usuario: result[0].username,
        titular: result[0].nombre,
        rol: result[0].idrol,
        token,
        fecha: fecha.split('/')[2] + '-' + fecha.split('/')[1] + '-' + fecha.split('/')[0],
        hora: getTime({ timezone: "America/La_Paz" }),
      };

      const [sesion] = await pool.query(`INSERT INTO sesion SET ?`, datos);
      // console.log('dentro del bloque', sesion)

      if (sesion.insertId > 0) {
        pool.query(`update usuarios SET ultimo_acceso= ${pool.escape(fecha.split('/')[2] + '-' + fecha.split('/')[1] + '-' + fecha.split('/')[0] + ' ' + getTime({ timezone: "America/La_Paz" }))} where 
        id= ${pool.escape(idusuario)}
        `);
        return res.json({
          token: token,
          username: result[0].username,
          nombre: result[0].nombre+' '+result[0].ap1,
          celular: result[0].celular,
          rol_des: result[0].rol,
          numRol: result[0].idrol,
          ok: true,
          msg: "Acceso correcto",
        });
      } else {
        return res.json({ msg: "Intente nuevamente ", ok: false });
      }
    } else {
      return res.json({ msg: "El usuario no existe !", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.json({ msg: "El servidor no responde !", ok: false });
  }
});

rutas.post("/logout", (req, res) => {
  try {
    // console.log(req.body, ' eliminar token bd');
    if (req.body.token) {
      const sql = `delete from sesion where token = ${pool.escape(
        req.body.token
      )} `;
      pool.query(sql);
    }
  } catch (error) { }
});

//VERIFICACION DE LA SESION QUE ESTA ALMACENADA EN LA BD
const verificacion = express();
verificacion.use((req, res, next) => {
  try {

    let fecha = getDate({ timeZone: "America/La_Paz", })
    let formato = fecha.split('/')[2] + '-' + fecha.split('/')[1] + '-' + fecha.split('/')[0] + ' ' + getTime({ timezone: "America/La_Paz" })
    // console.log(formato, ' hora peru')
    const bearerHeader = req.headers["authorization"];


    if (typeof bearerHeader !== "undefined") {

      const bearetoken = bearerHeader.split(" ")[1];

      jwt.verify(bearetoken, KEY, async (errtoken, authData) => {


        if (errtoken) {
          // console.log('error en la verificacion token alterado: ', bearetoken)
          pool.query("delete from sesion where token = ?", [bearetoken]);
          return res.json({
            ok: false,
            sesion: false,
            msg: "Su token a expirado, cierre sesion y vuelva a iniciar sesion",
          });
        }

        const sql = `SELECT idusuario, usuario, rol,  titular from sesion s 
                  where token  = ${pool.escape(bearetoken)}`;
        const [result] = await pool.query(sql);

        if (result.length > 0) {

          req.body.usuario = await result[0].idusuario;
          req.body.usernameS = await result[0].usuario;
          req.body.srol = await result[0].rol;
          req.body.nombreusuarioS = await result[0].titular;
          req.body.fecha_ = formato;
          // console.log(req.body, ' antes de pasar la validación')
          next();
        } else {
          console.log(' respuesta false')
          return res.json({
            ok: false,
            sesion: false,
            msg: "El Servidor no puede identificar su autencidad, cierre sesion y vuelva a intentar VERIFICACION",
          });
        }
      });
    } else {
      return res.json({
        ok: false,
        sesion: false,
        msg: "El Servidor no puede interpretar su autenticidad",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ ok: false, sesion: false, msg: "Error en el servidor" });
  }
});

const admin = (req, res, next) => {
  if (parseInt(req.body.srol) === 1) {
    // console.log(req.body.numero, 'numero rol')
    next();
  } else
    return res.json({
      ok: false,
      sesion: false,
      msg: "El Servidor no puede identificar su autencidad, cierre sesion y vuelva a intentar MIDLEWARE ADMIN",
    });
};

const auxiliar = (req, res, next) => {
  // console.log(req.body.srol, ' dato desde middleware rol')
  if (parseInt(req.body.srol) === 4) {
    next();
  } else
    return res.json({
      ok: false,
      sesion: false,
      msg: "El Servidor no puede identificar su autencidad, cierre sesion y vuelva a intentar MEDLEWARE AUXILIAR",
    });
};


const gerente = (req, res, next) => {
  // console.log(req.body.srol, ' dato desde middleware rol')
  if (parseInt(req.body.srol) === 2) {
    next();
  } else
    return res.json({
      ok: false,
      sesion: false,
      msg: "El Servidor no puede identificar su autencidad, cierre sesion y vuelva a intentar MEDLEWARE AUXILIAR",
    });
};


const cajero = (req, res, next) => {
  // console.log(req.body.srol, ' dato desde middleware rol')
  if (parseInt(req.body.srol) === 3) {
    next();
  } else
    return res.json({
      ok: false,
      sesion: false,
      msg: "El Servidor no puede identificar su autencidad, cierre sesion y vuelva a intentar MEDLEWARE AUXILIAR",
    });
};




// ADMINISTRADOR
rutas.use("/usuarios", verificacion, admin, usuario);
rutas.use("/clientes", verificacion, admin, clientes);
rutas.use("/tipo-tramites", verificacion, admin, tipoTramite);
rutas.use("/tramites", verificacion, admin, Tramite);

// AUXILIAR
rutas.use("/salidas", verificacion, auxiliar, salidas);

// GERENTE
rutas.use('/salidas-gerente', verificacion, gerente, SalidasGerente)

// CAJERO
rutas.use('/salidas-cajero', verificacion, cajero, SalidaCajero)
rutas.use('/ingresos-cajero', verificacion, cajero, IngresosCajero)


rutas.use("/miPerfil", verificacion, miPerfil);


export default rutas;
