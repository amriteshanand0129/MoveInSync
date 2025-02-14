const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicle_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 6,
      maxlength: 15,
    },
    vehicle_type: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    preferences: {
      music: {
        type: Boolean,
        default: false,
      },
      air_conditioner: {
        type: Boolean,
        default: false,
      },
      pets: {
        type: Boolean,
        default: false,
      },
      smoking: {
        type: Boolean,
        default: false,
      },
      luggage: {
        type: Boolean,
        default: false,
      },
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);