const path = require("node:path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const { crearControladorReservas } = require("./controladores/reservas");
const {
  crearValidadorReserva,
  prepararAreaReservas,
} = require("./middleware/reservas");
const { crearMiddlewareSolicitudes } = require("./middleware/solicitudes");
const crearRutasAplicacion = require("./rutas");
const crearRutasReservas = require("./rutas/reservas");

function crearAplicacion({ servicioReservas, configuracion }) {
  const app = express();
  const controlador = crearControladorReservas(servicioReservas);
  const validarReserva = crearValidadorReserva({
    salasPermitidas: controlador.salasPermitidas,
    turnosPermitidos: controlador.turnosPermitidos,
  });

  app.set("views", path.join(__dirname, "..", "views"));
  app.set("view engine", "ejs");
  app.use(morgan(configuracion.formatoMorgan));

  const { identificarSolicitud, medirDuracion } = crearMiddlewareSolicitudes();
  app.use(identificarSolicitud);
  app.use(medirDuracion);

  app.use(expressLayouts);
  app.set("layout", "layouts/main");
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use("/", crearRutasAplicacion(controlador));
  app.use(
    "/reservas",
    crearRutasReservas({
      controlador,
      prepararAreaReservas,
      validarReserva,
    }),
  );

  app.use((req, res) => {
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada | Sala Abierta",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  return app;
}

module.exports = { crearAplicacion };
