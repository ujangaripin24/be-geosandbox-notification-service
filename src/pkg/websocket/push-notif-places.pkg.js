let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;

  ioInstance.on("connection", (socket) => {
    console.log(`[WebSocket] Client terhubung: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`[WebSocket] Client terputus (${socket.id}): ${reason}`);
    });
  });
};

const sendPushNotification = (eventData) => {
  if (!ioInstance) {
    console.warn("[WebSocket] ioInstance belum diinisialisasi, notifikasi tidak terkirim.");
    return;
  }
  ioInstance.emit("pushPointPlacesNotification", eventData);
  console.log("[WebSocket] Notifikasi terkirim ke frontend:", eventData);
};

module.exports = {
  setSocketIO,
  sendPushNotification,
};
