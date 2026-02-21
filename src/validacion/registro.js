import { check } from "express-validator";
import { validaciones } from "./headers.js";

export const insertar = [

  check("consulta")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("diagnostico")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("tratamiento")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("desExamenFisico")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("examen")
    .matches(/^\d{1,10}$/)
    .exists(),
  check("paciente")
    .matches(/^\d{1,10}$/)
    .exists(),
  // check("img")
  //   .matches(/^.{1,10000000000}$/) 
  //   .exists(),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const modificar = [
  // check("id").isLength({ min: 1 }).exists().isNumeric(),
  check("idconsulta").isLength({ min: 1 }).exists().isNumeric(),
  check("consulta")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("diagnostico")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("tratamiento")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("desExamenFisico")
    .matches(/^.{1,1000}$/s)
    .exists(),
  check("examen")
    .matches(/^\d{1,10}$/)
    .exists(),
  check("paciente")
    .matches(/^\d{1,10}$/)
    .exists(),
  // check("img")
  //   .matches(/^.{1,10000000000}$/) 
  //   .exists(),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];

// buscar
