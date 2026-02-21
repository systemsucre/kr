import { check } from "express-validator";
import { validaciones } from "../headers.js";


export const insertar = [
  // C.I.: Permite números de 5 a 15 dígitos y opcionalmente extensión (ej. 1234567 LP)
  check("ci")
    .matches(/^\d{5,15}((\s|[-])\d{1,2}[A-Z]{1,2})?$/)
    .withMessage("C.I. no válido")
    .exists(),

  // Nombres y Apellidos: Mínimo 2 letras
  check("nombre")
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/)
    .withMessage("Nombre inválido")
    .exists(),

  check("ap1")
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/)
    .withMessage("Primer apellido inválido")
    .exists(),

  // ap2 es opcional en la base de datos, pero validamos formato si existe
  check("ap2")
    .optional({ checkFalsy: true })
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/),

  // Celular: Solo números, entre 7 y 10 dígitos
  check("celular")
    .optional({ checkFalsy: true })
    .matches(/^\d{7,10}$/)
    .withMessage("Número de celular inválido"),

  // ID Rol: Debe ser un número (ID de la tabla roles)
  check("id_rol")
    .isNumeric()
    .withMessage("Seleccione un rol válido")
    .exists(),

  // Username: Alfanumérico, puntos o guiones bajos (4 a 20 caracteres)
  check("username")
    .matches(/^[a-zA-Z0-9._]{4,20}$/)
    .withMessage("Nombre de usuario inválido (4-20 caracteres, sin espacios)")
    .exists(),

  // Contraseña: Mínimo 4 caracteres (puedes subirlo a 8 por seguridad)
  check("password")
    .isLength({ min: 4 })
    .withMessage("La contraseña debe tener al menos 4 caracteres")
    .exists(),

  // Middleware final que lanza los errores si existen
  (req, res, next) => {
    validaciones(req, res, next);
  },
];
export const actualizar = [
  // C.I.: Permite números de 5 a 15 dígitos y opcionalmente extensión (ej. 1234567 LP)
  check("ci")
    .matches(/^\d{5,15}((\s|[-])\d{1,2}[A-Z]{1,2})?$/)
    .withMessage("C.I. no válido")
    .exists(),

  // Nombres y Apellidos: Mínimo 2 letras
  check("nombre")
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/)
    .withMessage("Nombre inválido")
    .exists(),

  check("ap1")
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/)
    .withMessage("Primer apellido inválido")
    .exists(),

  // ap2 es opcional en la base de datos, pero validamos formato si existe
  check("ap2")
    .optional({ checkFalsy: true })
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/),

  // Celular: Solo números, entre 7 y 10 dígitos
  check("celular")
    .optional({ checkFalsy: true })
    .matches(/^\d{7,10}$/)
    .withMessage("Número de celular inválido"),

  // ID Rol: Debe ser un número (ID de la tabla roles)
  check("id_rol")
    .isNumeric()
    .withMessage("Seleccione un rol válido")
    .exists(),

  // Username: Alfanumérico, puntos o guiones bajos (4 a 20 caracteres)
  check("username")
    .matches(/^[a-zA-Z0-9._]{4,20}$/)
    .withMessage("Nombre de usuario inválido (4-20 caracteres, sin espacios)")
    .exists(),

  // Contraseña: Mínimo 4 caracteres (puedes subirlo a 8 por seguridad)
  check("password")
    .isLength({ min: 4 })
    .withMessage("La contraseña debe tener al menos 4 caracteres")
    .optional({checkFalsy:true}),

  // Middleware final que lanza los errores si existen
  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const recet = [
  check("id")
    .matches(/^\d{1,10}$/)
    .exists(),
  check("otros")
    .matches(/^.{4,3000}$/)
    .exists(),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const actualizarMiPerfil = [

  check("nombre")
    .matches(/^[a-zA-ZÑñ áéíóúÁÉÍÓÚ.]{2,3000}$/)
    .exists(),
  check("celular")
    .matches(/^\d{1,10}$/)
    .exists(),
  check("correo").matches(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const cambiarMiContraseña = [
  check("pass1").exists().isLength({ min: 5 }),
  check("pass2").exists().isLength({ min: 5 }),
  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const buscar = [
  check("dato")
    .matches(/^[()/a-zA-Z.@ Ññ0-9_-]{1,400}$/)
    .exists(),
  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const siguiente = [
  check("cantidad").isLength({ min: 1 }).exists().isNumeric(),
  check("id").isLength({ min: 1 }).exists().isNumeric(),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const anterior = [
  check("cantidad").isLength({ min: 1 }).exists().isNumeric(),
  check("id").isLength({ min: 1 }).exists().isNumeric(),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];

// buscar
