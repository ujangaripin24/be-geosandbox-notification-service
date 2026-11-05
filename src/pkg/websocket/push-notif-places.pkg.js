let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const sendPushNotification = (eventData) => {
  if (ioInstance) {
    ioInstance.emit('pushNotification', eventData);
    console.log("[WebSocket] Notifikasi terkirim ke frontend!");
  }
};

module.exports = {
  setSocketIO,
  sendPushNotification,
};