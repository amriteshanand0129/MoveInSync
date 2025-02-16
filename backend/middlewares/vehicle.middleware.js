// Dependencies
const logger = require("../logger");
const vehicle_model = require("../models/vehicle.model");

// Vehicle registration request body verification
const validateVehicleRegistrationBody = async (req, res, next) => {
  try {
    if (req.user.vehicle) {
      return res.status(401).send({
        error: "Vehicle already registered for this driver. You cannot register more than one vehicle",
      });
    }
    if (!req.body.vehicle_number || req.body.vehicle_number.length < 6 || req.body.vehicle_number.length > 15) {
      return res.status(401).send({
        error: "Vehicle Number size should be 6 to 15 characters",
      });
    }
    if (!req.body.vehicle_type || req.body.vehicle_type.length < 3 || req.body.vehicle_type.length > 20) {
      return res.status(401).send({
        error: "Vehicle Type size should be 3 to 20 characters",
      });
    }
    if (!req.body.model || req.body.model.length < 3 || req.body.model.length > 20) {
      return res.status(401).send({
        error: "Vehicle Model size should be 3 to 20 characters",
      });
    }
    if (!req.body.color || req.body.color.length < 3 || req.body.color.length > 20) {
      return res.status(401).send({
        error: "Vehicle Color size should be 3 to 20 characters",
      });
    }
    if (!req.body.capacity || req.body.capacity < 1 || req.body.capacity > 10) {
      return res.status(401).send({
        error: "Invalid Vehicle Capacity",
      });
    }
    const existingVehicle = await vehicle_model.findOne({ vehicle_number: req.body.vehicle_number });
    if (existingVehicle) {
      return res.status(409).send({
        error: "Vehicle with this number already exists",
      });
    }
    next();
  } catch (error) {
    logger.error("Error while verifying vehicle registration body: ", error);
    res.status(501).send({
      error: "Vehicle Registration Failed",
    });
  }
};

const validateVehicleUpdateBody = async (req, res, next) => {
  try {
    if (!req.body.vehicle_number || req.body.vehicle_number.length < 6 || req.body.vehicle_number.length > 15) {
      return res.status(401).send({
        error: "Vehicle Number size should be 6 to 15 characters",
      });
    }
    if (!req.body.vehicle_type || req.body.vehicle_type.length < 3 || req.body.vehicle_type.length > 20) {
      return res.status(401).send({
        error: "Vehicle Type size should be 3 to 20 characters",
      });
    }
    if (!req.body.model || req.body.model.length < 3 || req.body.model.length > 20) {
      return res.status(401).send({
        error: "Vehicle Model size should be 3 to 20 characters",
      });
    }
    if (!req.body.color || req.body.color.length < 3 || req.body.color.length > 20) {
      return res.status(401).send({
        error: "Vehicle Color size should be 3 to 20 characters",
      });
    }
    if (!req.body.capacity || req.body.capacity < 1 || req.body.capacity > 10) {
      return res.status(401).send({
        error: "Invalid Vehicle Capacity",
      });
    }
    next();
  } catch (error) {
    logger.error("Error while verifying vehicle update body: ", error);
    res.status(501).send({
      error: "Vehicle Update Failed",
    });
  }
};

module.exports = {
  validateVehicleRegistrationBody,
  validateVehicleUpdateBody,
};
