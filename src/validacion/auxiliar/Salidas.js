import { validaciones } from "../headers.js";
import { check } from "express-validator";

export const insertar = [
  // Relación con trámite
  check("id_tramite")
    .exists()
    .withMessage("El ID es requerido")
    .isUUID()
    .withMessage("ID de trámite no válido (formato UUID incorrecto)")
    .notEmpty()
    .withMessage("El ID no puede estar vacío"),

  // Monto (Dinero)
  check("monto")
    .exists().withMessage("El monto es obligatorio")
    .isFloat({ min: 0.01 }).withMessage("El monto debe ser un número positivo mayor a 0")
    .toFloat(), // Convierte a flotante

  // Detalle
  check("detalle")
    .exists().withMessage("El detalle es obligatorio")
    .trim()
    .isLength({ min: 5 }).withMessage("El detalle debe tener al menos 5 caracteres"),  
  
  // Fecha de solicitud
  check("fecha_solicitud")
    .exists().withMessage("La fecha de solicitud es obligatoria")
    .isISO8601().withMessage("Fecha de solicitud inválida (formato ISO 8601)"),

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

  check("monto")
    .optional()
    .isFloat({ min: 0.01 }).withMessage("El monto debe ser un número positivo")
    .toFloat(),

  check("detalle")
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage("El detalle debe tener mínimo 5 caracteres"),

  check("fecha_solicitud")
    .optional()
    .isISO8601().withMessage("Fecha de solicitud inválida"),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];