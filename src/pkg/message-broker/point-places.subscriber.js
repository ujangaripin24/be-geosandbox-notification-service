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
      "[notif-service] Received 'point_places_queue' payload: ",
      payload,
    );
    const { event_type, uuid_places, username, name_place, provinsi, is_read } =
      payload;
    if (!event_type || !uuid_places) {
      console.warn(
        "[notif-service] Missing event_type or uuid_places in message payload, skipping message",
      );
      return;
    }

    let newNotif = await NotifPointPlaces.findOne({
      where: { uuid_places, event_type },
    });

    if (!newNotif) {
      newNotif = await NotifPointPlaces.create({
        event_type,
        uuid_places,
        username: username || null,
        name_places: name_place,
        nama_provinsi: provinsi,
        is_read: is_read || "unread",
      });
      console.log(
        "[notif-service] Successfully created notif and saved to database",
      );
    } else {
      await newNotif.update({
        username: username || newNotif.username,
        name_places: name_place || newNotif.name_places,
        nama_provinsi: provinsi || newNotif.nama_provinsi,
        is_read: is_read || newNotif.is_read,
      });
      console.log(
        `[notif-service] Notif record for uuid_places ${uuid_places} (${event_type}) already exists, updated record.`,
      );
    }

    sendPushNotification({
      uuid: newNotif.uuid,
      event_type: newNotif.event_type,
      uuid_places: newNotif.uuid_places,
      username: newNotif.username,
      name_place: newNotif.name_places,
      nama_provinsi: newNotif.nama_provinsi,
      is_read: newNotif.is_read,
      createdAt: newNotif.createdAt,
    });
  });
};

/**
 * Listens to 'point_places_queue' queue from RabbitMQ
 * and creates/updates a NotifPointPlaces record in database.
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
        console.error("[notif-service] Auto DLQ replay error:", dlqErr.message);
      }
    }, 3000);
  };

  onChannelReady(startListener);

  try {
    if (getChannel()) await startListener();
  } catch (error) {
    console.error(
      "[notif-service] Failed to start 'point_places_queue' listener:",
      error.message,
    );
  }
};

module.exports = {
  listenPointPlacesQueue,
};
