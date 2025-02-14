// Dependencies
const jwt = require("jsonwebtoken");
const logger = require("../logger");

// Database models
const user_model = require("../models/user.model.js");

// Signup request body verification
const verifySignUpBody = async (req, res, next) => {
  try {
    if (!req.body.name || req.body.name.length < 3 || req.body.name.length > 50) {
      return res.status(401).send({
        error: "Name size should be 3 to 50 characters",
      });
    }
    if (!req.body.nickname || req.body.nickname.length < 3 || req.body.nickname.length > 30) {
      return res.status(401).send({
        error: "Nickname size should be 3 to 30 characters",
      });
    }
    if (!req.body.username || req.body.username.length < 3 || req.body.username.length > 20) {
      return res.status(401).send({
        error: "Username size should be 3 to 20 characters",
      });
    }
    if (!req.body.password || req.body.password.length < 8 || req.body.password.length > 16) {
      return res.status(401).send({
        error: "Password size should be 8 to 16 characters",
      });
    }
    if (!req.body.contact.email || !/^\S+@\S+\.\S+$/.test(req.body.contact.email)) {
      return res.status(401).send({
        error: "Invalid Email",
      });
    }
    if (!req.body.contact.phone || !/^\d{10}$/.test(req.body.contact.phone)) {
      return res.status(401).send({
        error: "Invalid Phone Number",
      });
    }
    if (!req.body.role && !["RIDER", "DRIVER"].includes(req.body.role.toUpperCase())) {
      return res.status(401).send({
        error: "Invalid Role",
      });
    }
    if (!req.body.gender || !["MALE", "FEMALE", "OTHER"].includes(req.body.gender.toUpperCase())) {
      return res.status(401).send({
        error: "Invalid Gender",
      });
    }
    if (!req.body.address.street || req.body.address.street.length < 10 || req.body.address.street.length > 100) {
      return res.status(401).send({
        error: "Address size should be 10 to 100 characters",
      });
    }
    if (!req.body.address.city || req.body.address.city.length < 2 || req.body.address.city.length > 50) {
      return res.status(401).send({
        error: "City size should be 2 to 50 characters",
      });
    }
    if (!req.body.address.state || req.body.address.state.length < 2 || req.body.address.state.length > 50) {
      return res.status(401).send({
        error: "State size should be 2 to 50 characters",
      });
    }
    if (!req.body.address.postalCode || !/^\d{6}$/.test(req.body.address.postalCode)) {
      return res.status(401).send({
        error: "Invalid Postal Code",
      });
    }

    const user = await user_model.findOne({
      $or: [{ username: req.body.username }, { "contact.email": req.body.contact.email }],
    });

    if (user) {
      if (user.contact.email === req.body.contact.email) {
        return res.status(401).send({
          error: "This Email is already in use. Try a different Email",
        });
      } else {
        return res.status(401).send({
          error: "Username already in use. Try a different Username",
        });
      }
    }
    next();
  } catch (err) {
    logger.error("AUTH | SignUp Request body validation failed: ", err);
    return res.status(501).send({
      error: "SignUp Request body validation failed",
    });
  }
};

// Signin request body verification
const verifySignInBody = (req, res, next) => {
  try {
    if (!req.body.username || req.body.username.length < 3 || req.body.username.length > 20) {
      return res.status(401).send({
        error: "Username size should be 3 to 20 characters",
      });
    }
    if (!req.body.password || req.body.password.length < 8 || req.body.password.length > 16) {
      return res.status(401).send({
        error: "Password size should be 8 to 16 characters",
      });
    }
    next();
  } catch (err) {
    logger.error("AUTH | SignIn Request body validation failed: ", err);
    return res.status(501).send({
      error: "SignIn Request body validation failed",
    });
  }
};

// Change password request body verification
const verifyChangePasswordBody = async (req, res, next) => {
  try {
    if (!req.body.username || req.body.username.length < 3 || req.body.username.length > 20) {
      return res.status(401).send({
        error: "Username size should be 3 to 20 characters",
      });
    }
    if (!req.body.password || req.body.password.length < 8 || req.body.password.length > 16) {
      return res.status(401).send({
        error: "Password size should be 8 to 16 characters",
      });
    }
    next();
  } catch (err) {
    logger.error("AUTH | Password change request body validation failed: ", err);
    return res.status(501).send({
      error: "Password change request body validation failed",
    });
  }
};

// Token verification
const validateToken = (req, res, next) => {
  if (req.cookies?.token) {
    const token = req.cookies.token;
    jwt.verify(token, process.env.secret, async (err, decoded) => {
      if (err) {
        return res.status(401).send({
          error: "Unauthorized, Invalid Token",
        });
      }
      try {
        const user = await user_model.findById(decoded.id);
        if (!user) {
          return res.status(401).send({
            error: "Unauthorized, the user for this token does not exist",
          });
        }
        req.user = user;
        next();
      } catch (error) {
        logger.error("AUTH | Error while searching for user in database: ", error);
        return res.status(501).send({
          error: "Token validation failed",
        });
      }
    });
  } else {
    return res.status(401).send({ error: "You are not logged in !" });
  }
};

// Admin verification
const isAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.role === "ADMIN") {
      next();
    } else {
      return res.status(403).send({
        error: "Only ADMIN user are allowed to access this endpoint",
      });
    }
  } catch (err) {
    logger.error("AUTH | Error while validating ADMIN: ", err);
    return res.status(401).send({
      error: "Failed to validate ADMIN status",
    });
  }
};

// Driver verification
const isDriver = (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.role === "DRIVER") {
      next();
    } else {
      return res.status(403).send({
        error: "Only DRIVER user are allowed to access this endpoint",
      });
    }
  } catch (err) {
    logger.error("AUTH | Error while validating DRIVER: ", err);
    return res.status(401).send({
      error: "Failed to validate DRIVER status",
    });
  }
};

// Rider verification
const isRider = (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.role === "RIDER") {
      next();
    } else {
      return res.status(403).send({
        error: "Only RIDER user are allowed to access this endpoint",
      });
    }
  } catch (err) {
    logger.error("AUTH | Error while validating RIDER: ", err);
    return res.status(401).send({
      error: "Failed to validate RIDER status",
    });
  }
};

module.exports = {
  verifySignUpbody: verifySignUpBody,
  verifySignInBody: verifySignInBody,
  verifyChangePasswordBody: verifyChangePasswordBody,
  validateToken: validateToken,
  isAdmin: isAdmin,
  isDriver: isDriver,
  isRider: isRider,
};
