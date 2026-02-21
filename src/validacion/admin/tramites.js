import { check } from "express-validator";
import { validaciones } from "../headers.js";

export const insertar = [
  // Relación con Cliente
  check("id_cliente")
    .isNumeric()
    .withMessage("Debe seleccionar un cliente válido")
    .exists()
    .notEmpty(),

  // Código único del trámite (Ej. KR-2024-001)
  check("codigo")
    .isLength({ min: 3, max: 50 })
    .matches(/^[A-Z]{3}-\d{8}$/)
    .withMessage("El código debe tener entre 3 y 50 caracteres")
    .exists()
    .notEmpty(),

  // Fechas
  check("fecha_ingreso")
    .isISO8601()
    .withMessage("Fecha de ingreso inválida")
    .exists(),

  check("fecha_finalizacion")
    .isISO8601()
    .withMessage("Fecha de finalización inválida")
    .exists(),



  // Relación con Tipo de Trámite
  check("id_tipo_tramite")
    .isNumeric()
    .withMessage("Debe seleccionar un tipo de trámite")
    .exists(),

  // Detalle / Descripción
  check("detalle")
    .isLength({ min: 5 })
    .withMessage("El detalle es obligatorio")
    .exists(),
  // Detalle / otros
  check("otros")
    .isLength({ min: 5 })
    .withMessage("no obligatorio")
    .optional({ checkFalsy: true }),


  // Costo (Dinero)
  check("costo")
    .isFloat({ min: 0 })
    .withMessage("El costo debe ser un valor numérico positivo")
    .exists(),

  // Auditoría
  check("usuario")
    .isNumeric()
    .withMessage("ID de usuario no válido")
    .exists(),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const actualizar = [
  check("id")
    .exists()
    .withMessage("El ID es requerido")
    .isUUID()
    .withMessage("ID de trámite no válido (formato UUID incorrecto)")
    .notEmpty()
    .withMessage("El ID no puede estar vacío"),

  check("id_cliente").optional().isNumeric(),

  check("codigo").optional().isLength({ min: 3 })
    .matches(/^[A-Z]{3}-\d{8}$/)
  ,

  check("fecha_ingreso").optional().isISO8601(),

  check("fecha_finalizacion").optional().isISO8601(),

  check("id_tipo_tramite").optional().isNumeric(),
  // Detalle / Descripción
  check("detalle")
    .isLength({ min: 5 })
    .withMessage("El detalle es obligatorio")
    .exists(),



  // Detalle / otros
  check("otros")
    .isLength({ min: 5 })
    .withMessage("no obligatorio")
    .optional({ checkFalsy: true }),

  check("costo").optional().isFloat({ min: 0 }),

  // Estado del trámite (1: en curso, 0: paralizado)
  check("estado")
    .optional()
    .isIn([0, 1])
    .withMessage("Estado no válido"),

  check("usuario")
    .isNumeric()
    .withMessage("ID de usuario no válido"),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];