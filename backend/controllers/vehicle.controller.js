// Dependencies
const mongoose = require("mongoose");
const logger = require("../logger");

// Database models
const model = require("../models/vehicle.model");
const user_model = require("../models/user.model");

const registerVehicle = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vehicleObj = {
      vehicle_number: req.body.vehicle_number,
      vehicle_type: req.body.vehicle_type,
      model: req.body.model,
      color: req.body.color,
      capacity: req.body.capacity,
      driver: req.user._id,
    };

    const vehicle_created = await model.create([vehicleObj], { session });

    const userUpdate = await user_model.findByIdAndUpdate(req.user._id, { $set: { vehicle: vehicle_created[0]._id } }, { session, new: true });

    if (!userUpdate) {
      throw new Error("User update failed after vehicle creation");
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).send({
      message: `Vehicle ${vehicle_created[0].vehicle_number} registered successfully!`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Error while registering vehicle: ", error);
    res.status(500).send({ error: "Vehicle Registration Failed" });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await model.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).send({ error: "Vehicle not found" });
    }

    if (vehicle.driver.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: "Unauthorized to update this vehicle" });
    }

    vehicle.vehicle_number = req.body.vehicle_number;
    vehicle.vehicle_type = req.body.vehicle_type;
    vehicle.model = req.body.model;
    vehicle.color = req.body.color;
    vehicle.capacity = req.body.capacity;

    await vehicle.save();

    res.status(200).send({ message: "Vehicle updated successfully" });
  } catch (error) {
    logger.error("Error while updating vehicle: ", error);
    res.status(500).send({ error: "Vehicle Update Failed" });
  }
};

module.exports = { registerVehicle, updateVehicle };
