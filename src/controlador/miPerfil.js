import { Router } from "express"
import { Usuario } from "../modelo/admin/usuario.js"
import { actualizarMiPerfil, cambiarMiContraseña } from '../validacion/admin/usuario.js'

//const modelo from "../modelo/usuario.js"
// desde esta plantilla se importa las funcionalidades de los controladores de los modulos


const rutas = Router()
const usuarios = new Usuario()
 



rutas.post("/ver", async (req, res) => {
// console.log(req.body.usuario, 'mi perfil')
    try {
        const resultado = await usuarios.miPerfil(req.body.usuario)
        return res.json({ ok: true, data: resultado })
    } catch (error) {
        console.log(error)
        return res.json({ error: 500, msg: error.sqlMessage });
    } 
})

rutas.post("/cambiarMiContrasena", cambiarMiContraseña, async (req, res) => {
    const { pass1, pass2, fecha_, usuario } = req.body
    const datos = { pass1, pass2, fecha_, usuario }
    try {
        await usuarios.cambiarMiContraseña(datos).then(j => {
            if (!j) return res.json({ msg: 'Contraseña actual incorrecta', ok: false })
            if (j) res.json({ ok: true, msg: 'La contraseña se ha cambiado correctamente', ok: true })
        })
    } catch (error) {
        console.log(error)
        return res.json({ error: 500, msg: error.sqlMessage });
    }
})


rutas.post("/actualizarMiPerfil", actualizarMiPerfil, async (req, res) => {
    // console.log(req.body)

    const { nombre, celular,  correo, fecha_, usuario } = req.body
    const datos = {

        nombre, celular,  correo,
        fecha_,
        usuario
    }
    try {
        await usuarios.actualizarMiPerfil(datos).then(j => {
            if (j.existe === 1) {
                return res.json({ msg: 'Este Correo ya esta registrado', ok: false })
            }
            console.log(j)
            return res.json({ ok: true, data: j, msg: 'Su perfil se ha actualizado correctamente' })
        })
        // console.log(resultado)

    } catch (error) {
        console.log(error)
        return res.json({ error: 500, msg: error.sqlMessage });
    }
})



export default rutas;