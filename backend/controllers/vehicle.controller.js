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
      preferences: {
        music: req.body.preferences?.music || false,
        air_conditioner: req.body.preferences?.air_conditioner || false,
        pets: req.body.preferences?.pets || false,
        smoking: req.body.preferences?.smoking || false,
        luggage: req.body.preferences?.luggage || false,
      },
      driver: req.user._id,
    };

    const vehicle_created = await model.create([vehicleObj], { session });

    const userUpdate = await user_model.findByIdAndUpdate(
      req.user._id,
      { $set: { vehicle: vehicle_created[0]._id } },
      { session, new: true }
    );

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

module.exports = { registerVehicle };
