const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

function crearControladorReservas(servicioReservas) {
  return {
    salasPermitidas,
    turnosPermitidos,

    inicio(_req, res) {
      res.render("inicio", { titulo: "Inicio | Sala Abierta" });
    },

    estado(_req, res) {
      res.json({
        servicio: "activo",
        reservas: servicioReservas.contar(),
        solicitudId: res.locals.solicitudId,
      });
    },

    listar(_req, res) {
      res.render("reservas/lista", {
        titulo: "Reservas | Sala Abierta",
        reservas: servicioReservas.listar(),
      });
    },

    nueva(_req, res) {
      res.render("reservas/nueva", {
        titulo: "Nueva reserva | Sala Abierta",
        valores: {},
        error: null,
        salasPermitidas,
        turnosPermitidos,
      });
    },

    detalle(req, res) {
      const reserva = servicioReservas.buscarPorId(Number(req.params.id));
      if (!reserva) {
        return res.status(404).render("no-encontrado", {
          titulo: "Reserva no encontrada | Sala Abierta",
          mensaje: "No existe una reserva con ese número.",
        });
      }
      return res.render("reservas/detalle", {
        titulo: `Reserva ${reserva.id} | Sala Abierta`,
        reserva,
      });
    },

    crear(req, res) {
      servicioReservas.crear(req.reservaValidada);
      return res.redirect("/reservas");
    },
  };
}

module.exports = { crearControladorReservas };
