const mongoose = require("mongoose");

const RideSchema = mongoose.Schema(
  {
    driver: {
      type: Object,
      required: true,
    },
    vehicle_details: {
      type: Object,
      required: true,
    },
    approved_passengers: [
      {
        type: Object,
      },
    ],
    pending_passengers: [
      {
        type: Object,
      },
    ],
    pickup_location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    dropoff_location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    departure_time: {
      type: Date,
      required: true,
    },
    ride_fare: {
      type: Number,
      required: true,
    },
    ride_preferences: {
      women_only: {
        type: Boolean,
        required: true,
        default: false,
      },
      music: {
        type: Boolean,
        required: true,
        default: false,
      },
      air_conditioner: {
        type: Boolean,
        required: true,
        default: false,
      },
      pets: {
        type: Boolean,
        required: true,
        default: false,
      },
      smoking: {
        type: Boolean,
        required: true,
        default: false,
      },
      luggage: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
    available_seats: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "IN_PROGRESS", "RIDE_FINISHED", "CANCELLED"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Ride", RideSchema);
