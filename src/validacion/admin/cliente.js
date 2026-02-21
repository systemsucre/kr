import { check } from "express-validator";
import { validaciones } from "../headers.js";

export const insertar = [
  // C.I.: Obligatorio para clientes
  check("ci")
    .matches(/^\d{5,15}((\s|[-])\d{1,2}[A-Z]{1,2})?$/)
    .withMessage("C.I. no válido")
    .exists()
    .notEmpty(),

  check("nombre")
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/)
    .withMessage("Nombre inválido")
    .exists()
    .notEmpty(),

  check("ap1")
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/)
    .withMessage("Primer apellido inválido")
    .exists()
    .notEmpty(),

  // Segundo apellido opcional
  check("ap2")
    .optional({ checkFalsy: true })
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/),

  // Celular obligatorio (según tu CREATE TABLE es NOT NULL)
  check("celular")
    .matches(/^\d{7,15}$/)
    .withMessage("Número de celular inválido")
    .exists()
    .notEmpty(),

  // Dirección obligatoria
  check("direccion")
    .isLength({ min: 5, max: 255 })
    .withMessage("La dirección es demasiado corta")
    .exists()
    .notEmpty(),

  // ID del usuario que registra (obligatorio según tu esquema)
  check("usuario")
    .isNumeric()
    .withMessage("Usuario de registro no válido")
    .exists(),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const actualizar = [
  // ID del cliente necesario para actualizar
  check("id")
    .isNumeric()
    .exists(),

  check("ci")
    .matches(/^\d{5,15}((\s|[-])\d{1,2}[A-Z]{1,2})?$/)
    .withMessage("C.I. no válido"),

  check("nombre")
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/),

  check("ap1")
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/),

  check("ap2")
    .optional({ checkFalsy: true })
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{2,100}$/),

  check("celular")
    .matches(/^\d{7,15}$/),

  check("direccion")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 }),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];