const { getIo } = require('./socket');

const emitToUser = (userId, event, payload) => {
  try {
    const io = getIo();
    io.to(`user:${userId}`).emit(event, payload);
  } catch (_) {}
};

const emitToAdmins = (event, payload) => {
  try {
    const io = getIo();
    io.to('admins').emit(event, payload);
  } catch (_) {}
};

const emitToOrder = (orderId, event, payload) => {
  try {
    const io = getIo();
    io.to(`order:${orderId}`).emit(event, payload);
  } catch (_) {}
};

const emitter = {
  to: (room) => ({
    emit: (event, payload) => {
      try {
        const io = getIo();
        io.to(room).emit(event, payload);
      } catch (_) {}
    },
  }),
  emit: (event, payload) => {
    try {
      const io = getIo();
      io.emit(event, payload);
    } catch (_) {}
  },
};

module.exports = {
  emitter,
  emitToUser,
  emitToAdmins,
  emitToOrder,
};
