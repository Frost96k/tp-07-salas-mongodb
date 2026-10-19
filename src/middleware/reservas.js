function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

function crearValidadorReserva({ salasPermitidas, turnosPermitidos }) {
  return function validarReserva(req, res, next) {
    const cuerpo = req.body || {};
    const valores = {
      estudiante: String(cuerpo.estudiante ?? "").trim(),
      email: String(cuerpo.email ?? "").trim(),
      sala: String(cuerpo.sala ?? "").trim(),
      fecha: String(cuerpo.fecha ?? "").trim(),
      turno: String(cuerpo.turno ?? "").trim(),
      personas: String(cuerpo.personas ?? "").trim(),
    };
    const personas = Number(valores.personas);
    let error = null;

    if (
      !valores.estudiante ||
      !valores.email ||
      !valores.sala ||
      !valores.fecha ||
      !valores.turno ||
      !valores.personas
    ) {
      error = "Completa todos los campos para continuar.";
    } else if (!valores.email.includes("@")) {
      error = "Ingresa un email que incluya @.";
    } else if (!salasPermitidas.includes(valores.sala)) {
      error = "Selecciona una sala permitida.";
    } else if (!turnosPermitidos.includes(valores.turno)) {
      error = "Selecciona un turno permitido.";
    } else if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
      error = "La cantidad debe ser un número entero entre 1 y 6.";
    }

    if (error) {
      return res.status(400).render("reservas/nueva", {
        titulo: "Revisa tu reserva | Sala Abierta",
        valores,
        error,
        salasPermitidas,
        turnosPermitidos,
      });
    }

    req.reservaValidada = { ...valores, personas };
    return next();
  };
}

module.exports = { crearValidadorReserva, prepararAreaReservas };
