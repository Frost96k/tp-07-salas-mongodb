function crearServicioReservas(datosIniciales = []) {
  const reservas = datosIniciales.map((reserva) => ({ ...reserva }));
  let siguienteId =
    reservas.reduce((mayorId, reserva) => Math.max(mayorId, reserva.id), 0) + 1;

  return {
    listar() {
      return reservas;
    },
    buscarPorId(id) {
      return reservas.find((reserva) => reserva.id === id);
    },
    contar() {
      return reservas.length;
    },
    crear(datos) {
      const reserva = { id: siguienteId, ...datos };
      siguienteId += 1;
      reservas.push(reserva);
      return reserva;
    },
  };
}

module.exports = { crearServicioReservas };
