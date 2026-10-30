const {
  onChannelReady,
  getChannel,
} = require("../../config/message-broker.config");
const {
  reciverMessageData,
  reprocessDLQMessages,
} = require("./message-broker.pkg");

let consumerRegistered = false;

const consumePointPlacesQueue = async () => {
  await reciverMessageData(["point_places_queue"], async (msg) => {
    if (!msg) return;
    const payload = JSON.parse(msg.content.toString());
    console.log(
      "[gis-service] Reciver 'point_places_queue' payload: ",
      payload,
    );
  });
};

/**
 * Listens to 'user_activated' queue from RabbitMQ
 * and creates a new DetailUsers record in database.
 * Also attempts to reprocess any DLQ messages when listener starts.
 */
const listenPointPlacesQueue = async () => {
  if (consumerRegistered) return;
  consumerRegistered = true;

  const startListener = async () => {
    await consumePointPlacesQueue();
    setTimeout(async () => {
      try {
        await reprocessDLQMessages("point_places_queue");
      } catch (dlqErr) {
        console.error("[user-service] Auto DLQ replay error:", dlqErr.message);
      }
    }, 3000);
  };

  onChannelReady(startListener);

  try {
    if (getChannel()) await startListener();
  } catch (error) {
    console.error(
      "[user-service] Failed to start 'user_activated' listener:",
      error.message,
    );
  }
};

module.exports = {
  listenPointPlacesQueue,
};
