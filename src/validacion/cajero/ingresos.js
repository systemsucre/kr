import { validaciones } from "../headers.js";
import { check } from "express-validator";

export const insertar = [

  // Relación con el Cliente
  check("id_cliente")
    .exists().withMessage("El ID del cliente es obligatorio")
    .isInt().withMessage("El ID del cliente debe ser un número entero"),

  // Relación con el Trámite
  check("id_tramite")
    .exists().withMessage("El ID del trámite es requerido")
    .isUUID().withMessage("ID de trámite no válido (formato UUID incorrecto)"),

  // Monto (Si decidiste agregarlo a la tabla, ya que no estaba en tu SQL inicial pero es vital)
  check("monto")
    .exists().withMessage("El monto es obligatorio")
    .isFloat({ min: 0.01 }).withMessage("El monto debe ser un número positivo")
    .toFloat(),

  // Detalle del ingreso
  check("detalle")
    .exists().withMessage("El detalle es obligatorio")
    .trim()
    .isLength({ min: 5 }).withMessage("El detalle debe tener al menos 5 caracteres"),

  // Fecha en que se percibe el ingreso
  check("fecha_ingreso")
    .exists().withMessage("La fecha de ingreso es obligatoria")
    .isISO8601().withMessage("Fecha de ingreso inválida (formato ISO 8601)"),

  // ID del Usuario que registra
  check("usuario")
    .exists().withMessage("El usuario es obligatorio")
    .isInt().withMessage("El ID de usuario debe ser un número"),

  // Fecha de creación del registro
  check("created_at")
    .exists().withMessage("La fecha de creación es obligatoria")
    .isISO8601().withMessage("Fecha de creación inválida"),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];

export const actualizar = [
  // ID obligatorio para localizar el registro
  check("id")
    .exists().withMessage("El ID es requerido")
    .isUUID().withMessage("ID no válido"),

  check("id_cliente")
    .optional()
    .isInt().withMessage("El ID del cliente debe ser un número"),

  check("id_tramite")
    .optional()
    .isUUID().withMessage("ID de trámite no válido"),

  check("monto")
    .optional()
    .isFloat({ min: 0.01 }).withMessage("El monto debe ser un número positivo")
    .toFloat(),

  check("detalle")
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage("El detalle debe tener mínimo 5 caracteres"),

  check("fecha_ingreso")
    .optional()
    .isISO8601().withMessage("Fecha de ingreso inválida"),

  check("updated_at")
    .exists().withMessage("La fecha de actualización es obligatoria")
    .isISO8601().withMessage("Fecha de actualización inválida"),

  (req, res, next) => {
    validaciones(req, res, next);
  },
];