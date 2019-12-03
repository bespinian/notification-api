var restify = require("restify");
var bodyParser = require("restify-plugins").bodyParser;
var server = restify.createServer();
var packageJson = require("./package.json");
var mongoose = require("mongoose");
var Notification = require("./notification/model.js").Notification;
var corsMiddleware = require("restify-cors-middleware");
var amqp = require("amqplib");

var mqUrl = process.env.MQ_URL || "amqp://notification-mq";
var dbUrl = process.env.DB_URL || "mongodb://notification-db:27017";

function sendJsonMessage(message) {
  return amqp
    .connect(mqUrl)
    .then(function(conn) {
      return conn
        .createChannel()
        .then(function(ch) {
          return ch
            .assertQueue("notifications", { durable: false })
            .then(function() {
              ch.sendToQueue(
                "notifications",
                Buffer.from(JSON.stringify(message))
              );
              return ch.close();
            })
            .catch(console.warn);
        })
        .finally(function() {
          return conn.close();
        });
    })
    .catch(console.warn);
}

var cors = corsMiddleware({
  origins: ["*"],
  allowHeaders: [],
  exposeHeaders: []
});

server.pre(cors.preflight);
server.use(cors.actual);

server.use(bodyParser());

server.get("/", function(req, res, next) {
  var apiInfo = {
    name: packageJson.name,
    version: packageJson.version
  };
  return res.send(apiInfo);
});

server.get("/notification", function(req, res, next) {
  Notification.find()
    .exec()
    .then(function(notifications) {
      return res.send(notifications);
    });
});

server.post("/notification", function(req, res, next) {
  var notification = new Notification();
  notification.text = req.body.text;
  notification.save().then(function(savedNotification) {
    sendJsonMessage(savedNotification);
    return res.send(204, savedNotification);
  });
});

server.del("/notification/:notificationid", function(req, res, next) {
  Notification.findByIdAndRemove(req.params.notificationid, function(
    removedNotification
  ) {
    return res.send(204);
  });
});

mongoose.connect(dbUrl + "/notifications");
server.listen(3000, "0.0.0.0", function() {
  console.log("server listening at %s on port %s", "127.0.0.1", 3000);
  console.log("MQ url: %s", mqUrl);
  console.log("DB url: %s", dbUrl);
});
