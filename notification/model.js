const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    text: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

mongoose.model("Notification", NotificationSchema);
const Notification = mongoose.model("Notification");

module.exports = {
  Notification,
  NotificationSchema,
};
