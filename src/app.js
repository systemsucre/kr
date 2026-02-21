import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";

import { PORT } from "./config.js";
import ruta from './rutas/rutas.js'

//inicializar
const app = express();
app.use(cors());

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../imagenes")));

// app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: "50mb", extended: false, parameterLimit:51200000}));
app.set("puerto", PORT);




app.disable("x-powered-by"); // evita que el atacante sepa que
//ejecutamos express js como servidor
// app.use(rutas);
app.use(ruta)

app.listen(app.get("puerto"), () => {
  console.log("servidor corriendo en: ", PORT);
});
