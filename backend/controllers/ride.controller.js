// Dependencies
const mongoose = require("mongoose");
const logger = require("../logger");
const { broadcastRideUpdate, removeRideAndBroadcast, updateRideAndBroadcast,  } = require("../websocket");

// Database models
const vehicle_model = require("../models/vehicle.model");
const user_model = require("../models/user.model");
const ride_model = require("../models/ride.model");

const registerRide = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const vehicle = await vehicle_model.findById(req.user.vehicle);
  try {
    const rideObj = {
      driver: {
        _id: req.user._id,
        name: req.user.name,
        gender: req.user.gender,
        contact: req.user.contact,
      },
      vehicle_details: vehicle,
      approved_passengers: [],
      pending_passengers: [],
      pickup_location: req.body.pickup_location,
      dropoff_location: req.body.dropoff_location,
      departure_time: req.body.departure_time,
      ride_fare: req.body.ride_fare,
      ride_preferences: req.body.ride_preferences,
      available_seats: req.body.available_seats || req.user.vehicle.capacity,
      status: "ACTIVE",
    };

    const ride_created = await ride_model.create([rideObj], { session });

    const userUpdate = await user_model.findByIdAndUpdate(req.user._id, { ride_status: "RIDING" }, { session });

    if (!userUpdate) {
      throw new Error("Failed to update user's ride status");
    }

    broadcastRideUpdate(ride_created[0]);
    await session.commitTransaction();
    session.endSession();


    res.status(201).send({
      message: `Ride created successfully!`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Error while creating ride: ", error);
    res.status(500).send({ error: "Ride Creation Failed" });
  }
};

const startRide = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await ride_model.findById(req.params.ride_id).session(session);

    if (!ride) {
      return res.status(404).send({ error: "Ride not found" });
    }

    if (!ride.driver._id || ride.driver._id.toString() !== req.user._id.toString()) {
      return res.status(401).send({ error: "Unauthorized to start ride" });
    }

    if (ride.status !== "ACTIVE") {
      return res.status(400).send({ error: "Ride is not active" });
    }

    ride.status = "IN_PROGRESS";
    ride.departure_time = new Date();
    await ride.save();

    removeRideAndBroadcast(ride._id);
    await session.commitTransaction();
    session.endSession();


    res.status(200).send({ message: "Ride started successfully!" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Error while starting ride: ", error);
    res.status(500).send({ error: "Failed to start ride" });
  }
};

const finishRide = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await ride_model.findById(req.params.ride_id).session(session);

    if (!ride) {
      return res.status(404).send({ error: "Ride not found" });
    }

    if (!ride.driver._id || ride.driver._id.toString() !== req.user._id.toString()) {
      return res.status(401).send({ error: "Unauthorized to finish ride" });
    }

    if (ride.status !== "IN_PROGRESS") {
      return res.status(400).send({ error: "Ride is not in progress" });
    }

    ride.status = "RIDE_FINISHED";
    await ride.save();

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({ message: "Ride finished successfully!" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Error while finishing ride: ", error);
    res.status(500).send({ error: "Failed to finish ride" });
  }
};

const cancelRide = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await ride_model.findById(req.params.ride_id).session(session);

    if (!ride) {
      return res.status(404).send({ error: "Ride not found" });
    }

    if (!ride.driver._id || ride.driver._id.toString() !== req.user._id.toString()) {
      return res.status(401).send({ error: "Unauthorized to cancel ride" });
    }

    if (ride.status !== "ACTIVE") {
      return res.status(400).send({ error: "Ride is not active" });
    }

    ride.status = "CANCELLED";
    await ride.save();

    const userUpdate = await user_model.findByIdAndUpdate(req.user._id, { ride_status: "OFFLINE" }, { session });

    if (!userUpdate) {
      throw new Error("Failed to update user's ride status");
    }

    removeRideAndBroadcast(ride._id);
    await session.commitTransaction();
    session.endSession();


    res.status(200).send({ message: "Ride cancelled successfully!" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Error while cancelling ride: ", error);
    res.status(500).send({ error: "Failed to cancel ride" });
  }
};

const requestRide = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await ride_model.findById(req.params.ride_id).session(session);

    if (!ride) {
      return res.status(404).send({ error: "Ride not found" });
    }

    if (ride.driver._id && ride.driver._id.toString() === req.user._id.toString()) {
      return res.status(400).send({ error: "Driver cannot request ride" });
    }

    if (ride.status !== "ACTIVE") {
      return res.status(400).send({ error: "Ride is not active" });
    }

    if (ride.ride_preferences.women_only && req.user.gender === "MALE") {
      return res.status(400).send({ error: "This ride is for women only" });
    }

    if (ride.approved_passengers.length >= ride.available_seats) {
      return res.status(400).send({ error: "Ride is full" });
    }

    if (ride.pending_passengers.length !== 0 && ride.pending_passengers.find((passenger) => passenger._id.toString() === req.user._id.toString())) {
      return res.status(400).send({ error: "Ride already requested" });
    }

    ride.pending_passengers.push({
      _id: req.user._id,
      nickname: req.user.nickname,
      gender: req.user.gender,
    });
    await ride.save();

    updateRideAndBroadcast(ride);
    await session.commitTransaction();
    session.endSession();


    res.status(200).send({ message: "Ride requested successfully!" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Error while requesting ride: ", error);
    res.status(500).send({ error: "Failed to request ride" });
  }
};

const acceptRideRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await ride_model.findById(req.params.ride_id).session(session);

    if (!ride) {
      return res.status(404).send({ error: "Ride not found" });
    }

    if (!ride.driver._id || ride.driver._id.toString() !== req.user._id.toString()) {
      return res.status(401).send({ error: "Unauthorized to accept ride request" });
    }

    if (ride.status !== "ACTIVE") {
      return res.status(400).send({ error: "Ride is not active" });
    }

    if (ride.approved_passengers.length >= ride.available_seats) {
      return res.status(400).send({ error: "Ride is full" });
    }

    const passenger = ride.pending_passengers.find((passenger) => passenger._id.toString() === req.params.passenger_id);

    if (!passenger) {
      return res.status(404).send({ error: "Passenger not found" });
    }

    ride.pending_passengers = ride.pending_passengers.filter((passenger) => passenger._id.toString() !== req.params.passenger_id);
    ride.approved_passengers.push(passenger);
    await ride.save();

    updateRideAndBroadcast(ride);
    await session.commitTransaction();
    session.endSession();


    res.status(200).send({ message: "Ride request accepted successfully!" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Error while accepting ride request: ", error);
    res.status(500).send({ error: "Failed to accept ride request" });
  }
};

const getRideDetails = async (req, res) => {
  try {
    const ride = await ride_model.findById(req.params.ride_id);

    if (!ride) {
      return res.status(404).send({ error: "Ride not found" });
    }

    if (ride.driver._id.toString() !== req.user._id.toString() || ride.approved_passengers.some(passenger => passenger._id.toString() === req.user._id.toString())) {
      return res.status(401).send({ error: "Unauthorized to view ride details" });
    }

    res.status(200).send({ ride });
  } catch (error) {
    logger.error("Error while fetching ride details: ", error);
    res.status(500).send({ error: "Failed to fetch ride details" });
  }
};

module.exports = {
  registerRide,
  startRide,
  finishRide,
  cancelRide,
  requestRide,
  acceptRideRequest,
  getRideDetails,
};
