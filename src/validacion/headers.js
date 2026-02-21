
import { validationResult } from "express-validator"
export const validaciones = (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            // Usamos 'path' que es el estándar actual, o 'param' como respaldo
            const campoError = error.errors[0].path || error.errors[0].param;
            
            console.log('Error de validación en:', campoError, 'Valor recibido:', req.body[campoError]);
            
            return res.json({ 
                msg: `Verifique el campo: "${campoError}"`, 
                ok: false, 
                data: campoError 
            });
        }
        return next();
    }
    catch (e) {
        console.error("Error en middleware validaciones:", e);
        return res.status(500).json({ ok: false, msg: "Error interno en validaciones" });
    }
}