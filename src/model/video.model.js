import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String, // cloudinary url
      required: true,
    },
    videoUrl: {
      type: String, //cloudinary url
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
videoSchema.plagin(mongooseAggregatePaginate);// agregate purpose
export const Video = mongoose.model("Video", videoSchema);
