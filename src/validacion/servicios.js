import { check } from "express-validator";
import { validaciones } from "./headers.js";

export const insertar = [
  check("cantidad").isLength({ min: 1 }).isNumeric(),
  check("sexo").isLength({ min: 1 }).exists().isNumeric(),
  check("nhc")
    .matches(/^\d{5,15}((\s|[-])\d{1}[A-Z]{1})?$/)
    .exists(),
  check("ap1")
    .matches(/^[a-zA-ZÑñ áéíóúÁÉÍÓÚ]{2,50}$/)
    .exists(),
  check("ap2")
    .matches(/^[a-zA-Z-Ññ áéíóúÁÉÍÓÚ]{2,50}$/),
  check("nombre")
    .matches(/^[a-zA-ZÑñ áéíóúÁÉÍÓÚ]{2,50}$/)
    .exists(),
  check("fechan")
    .matches(/\d{4}[-]\d{2}[-]\d{2}/)
    .exists(),
  check("ec").isLength({ min: 1 }).isNumeric(),
  check("na").isLength({ min: 1 }).isNumeric(),
  check("celular").matches(/^\d{5,13}$/).exists(),
  check("direccion")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("municipio")
    .matches(/^.{1,1000}$/s),
  check("ant")
    .matches(/^.{1,1000}$/s),
  check("gsangre")
    .matches(/^.{1,1000}$/s),
  check("otros")
    .matches(/^.{1,1000}$/s),
  check("ocupacion")
    .matches(/^.{1,1000}$/s).exists(),
    
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
