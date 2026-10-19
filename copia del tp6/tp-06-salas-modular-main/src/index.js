const { crearAplicacion } = require("./app");
const { leerConfiguracion } = require("./configuracion");
const { crearServicioReservas } = require("./servicios/reservas");

const datosIniciales = [
  {
    id: 1,
    estudiante: "Lucía Fernández",
    email: "lucia.fernandez@example.com",
    sala: "Sala Norte",
    fecha: "2026-09-23",
    turno: "Mañana",
    personas: 2,
  },
  {
    id: 2,
    estudiante: "Mateo González",
    email: "mateo.gonzalez@example.com",
    sala: "Sala Sur",
    fecha: "2026-09-24",
    turno: "Tarde",
    personas: 4,
  },
  {
    id: 3,
    estudiante: "Sofía Romero",
    email: "sofia.romero@example.com",
    sala: "Sala Multimedia",
    fecha: "2026-09-25",
    turno: "Noche",
    personas: 3,
  },
  {
    id: 4,
    estudiante: "Tomás Herrera",
    email: "tomas.herrera@example.com",
    sala: "Sala Norte",
    fecha: "2026-09-26",
    turno: "Mañana",
    personas: 1,
  },
];

const configuracion = leerConfiguracion(process.env);
const servicioReservas = crearServicioReservas(datosIniciales);
const app = crearAplicacion({ servicioReservas, configuracion });

app.listen(configuracion.port, () => {
  console.log(
    `Sala Abierta disponible en http://localhost:${configuracion.port}`,
  );
});
