import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    types: Schema.Types.ObjectId,
    ref: "User",
  },
  channel: {
    types: Schema.Types.ObjectId,
    ref: "User",
  },
});
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
