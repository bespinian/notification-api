const restify = require("restify");
const bodyParser = require("restify-plugins").bodyParser;
const packageJson = require("./package.json");
const mongoose = require("mongoose");
const Notification = require("./notification/model.js").Notification;
const corsMiddleware = require("restify-cors-middleware");
const amqp = require("amqplib");
const Logger = require("bunyan");

const queueName = "notifications";

const mqUrl = process.env.MQ_URL || "amqp://notification-mq";
const dbUrl = process.env.DB_URL || "mongodb://notification-db";

const log = new Logger.createLogger({
  name: "notification-api",
  serializers: {
    req: Logger.stdSerializers.req,
  },
});

const server = restify.createServer({
  name: packageJson.name,
  version: packageJson.version,
  log,
});

const sendJsonMessage = async (message) => {
  try {
    const conn = await amqp.connect(mqUrl);
    const chan = await conn.createChannel();

    await chan.assertQueue(queueName, { durable: false });
    await chan.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));

    await chan.close();
    await conn.close();
  } catch (err) {
    console.error(err);
  }
};

const cors = corsMiddleware({
  origins: ["*"],
  allowHeaders: [],
  exposeHeaders: [],
});

server.pre(cors.preflight);
server.use(cors.actual);

server.use(bodyParser());

server.pre((request, response, next) => {
  request.log.info({ req: request }, "REQUEST");
  next();
});

server.get("/", (req, res, next) => {
  const apiInfo = {
    name: packageJson.name,
    version: packageJson.version,
  };
  return res.send(apiInfo);
});

server.get("/notification", async (req, res, next) => {
  const notification = await Notification.find().exec();
  return res.send(notification);
});

server.post("/notification", async (req, res, next) => {
  const notification = new Notification();
  notification.text = req.body.text;
  const savedNotification = await notification.save();
  await sendJsonMessage(savedNotification);
  return res.send(204, savedNotification);
});

server.del("/notification/:notificationid", (req, res, next) => {
  Notification.findByIdAndRemove(
    req.params.notificationid,
    (removedNotification) => {
      res.send(204);
    }
  );
});

mongoose.connect(`${dbUrl}/notifications`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

server.listen(3000, "0.0.0.0", () => {
  console.log("server listening at %s on port %s", "localhost", 3000);
  console.log("MQ URL: %s", mqUrl);
  console.log("DB URL: %s", dbUrl);
});
