const {
  listenPointPlacesQueue,
} = require("./pkg/message-broker/point-places.subscriber");
const {
  setSocketIO,
} = require("./pkg/websocket/push-notif-places.pkg");
const cors = require("cors");
const express = require("express");
const logger = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const helmet = require("helmet");
const createError = require("http-errors");
const messageBroker = require("./config/message-broker.config");
const database = require("./config/database.config");
const { version } = require("../package.json");

dotenv.config();

let app = express();
const server = http.createServer(app);

const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

const io = new Server(server, {
  path: "/api/v1/notif/socket.io",
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setSocketIO(io);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: false,
    },
    hidePoweredBy: true,
    frameguard: { action: "deny" },
    dnsPrefetchControl: { allow: false },
    ieNoOpen: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  }),
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Client-Type"],
  }),
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/notif/health", (req, res) => {
  res.status(200).json({
    status: 200,
    versionApp: version,
    message: "[SERVICE-NOTIFICATION] Server Berhasil Berjalan",
    date: new Date().toISOString().replace("T", " ").substring(0, 19),
  });
});

app.use((req, res, next) => {
  res.status(404).json(createError(404, "Not Found Page you looking for"));
});

server.listen(process.env.APP_PORT, async () => {
  console.log(
    `[SERVICE-NOTIFICATION] Server berjalan di port ${process.env.APP_PORT}`,
  );
  try {
    await database.authenticate();
    await messageBroker.connectRabbitMQ();
    await listenPointPlacesQueue();
  } catch (error) {
    console.error("Unable to start server:");
    console.error(error.message);
    process.exit(1);
  }
});

module.exports = app;

