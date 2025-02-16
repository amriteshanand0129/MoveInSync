const logger = require("../logger");

const checkRideCreationRequest = async (req, res, next) => {
  try {
    if(req.user.ride_status === "RIDING") {
      return res.status(401).send({
        error: "Driver already has an active ride. Cannot create a new ride",
      });
    }
    if (!req.user.vehicle) {
      return res.status(401).send({
        error: "Driver has not registered any vehicle. Please register a vehicle before creating a ride",
      });
    }
    if (!req.body.pickup_location || !req.body.dropoff_location || !req.body.departure_time || !req.body.ride_fare || !req.body.ride_preferences) {
      return res.status(401).send({
        error: "Invalid Ride Creation Request Body",
      });
    }
    if (!req.body.pickup_location.latitude || !req.body.pickup_location.longitude || !req.body.pickup_location.address) {
      return res.status(401).send({
        error: "Invalid Pickup Location",
      });
    }
    if (!req.body.dropoff_location.latitude || !req.body.dropoff_location.longitude || !req.body.dropoff_location.address) {
      return res.status(401).send({
        error: "Invalid Dropoff Location",
      });
    }
    if (req.body.departure_time < new Date()) {
      return res.status(401).send({
        error: "Departure time cannot be in the past",
      });
    }
    if (req.body.ride_fare < 0) {
      return res.status(401).send({
        error: "Ride fare cannot be negative",
      });
    }   
    next();
  } catch (error) {
    logger.error("Error while verifying ride creation request body: ", error);
    res.status(501).send({
      error: "Ride Creation Failed",
    });
  }
};

module.exports = {
  checkRideCreationRequest,
};
