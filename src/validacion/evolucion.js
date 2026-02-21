import { check } from "express-validator";
import { validaciones } from "./headers.js";

export const insertarEvolucion_ = [

  check("consulta").isLength({ min: 1 }).exists().isNumeric(),
  check("evolucion")
    .matches(/^.{1,1000}$/s)
    .exists(),

  check("diagnostico")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("conducta")
    .matches(/^.{1,1000}$/s)
    .exists(),
  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const editarEvolucion_ = [

  check("id").isLength({ min: 1 }).exists().isNumeric(),
  check("consulta").isLength({ min: 1 }).exists().isNumeric(),
  check("evolucion")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("diagnostico")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("conducta")
    .matches(/^.{1,1000}$/s)
    .exists(),
  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const eliminarEvolucion_ = [
  check("consulta").isLength({ min: 1 }).exists().isNumeric(),

  check("id").isLength({ min: 1 }).exists().isNumeric(),
  (req, res, next) => {
    validaciones(req, res, next);
  },
];



