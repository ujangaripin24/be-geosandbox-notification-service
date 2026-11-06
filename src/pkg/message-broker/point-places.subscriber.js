const {
  onChannelReady,
  getChannel,
} = require("../../config/message-broker.config");
const {
  reciverMessageData,
  reprocessDLQMessages,
} = require("./message-broker.pkg");

const { NotifPointPlaces } = require("../../models");
const { sendPushNotification } = require("../websocket/push-notif-places.pkg");

let consumerRegistered = false;

const consumePointPlacesQueue = async () => {
  await reciverMessageData(["point_places_queue"], async (msg) => {
    if (!msg) return;
    const payload = JSON.parse(msg.content.toString());
    console.log(
      "[gis-service] Reciver 'point_places_queue' payload: ",
      payload,
    );
    const { event_type, uuid_places, username, name_place, provinsi, is_read } =
      payload;
    if (!event_type) {
      console.warn("[notif-service] Missing data message payload");
      return;
    }
    const newNotif = await NotifPointPlaces.create({
      event_type,
      uuid_places,
      username: username || null,
      name_places: name_place,
      nama_provinsi: provinsi,
      is_read: is_read || "unread",
    });

    sendPushNotification({
      event_type: newNotif.event_type,
      uuid_places: newNotif.uuid_places,
      username: newNotif.username,
      name_place: newNotif.name_places,
      nama_provinsi: newNotif.nama_provinsi,
      is_read: newNotif.is_read,
      createdAt: newNotif.createdAt,
    });

    console.log("[notif-service] Successfully create notif save to database");
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
