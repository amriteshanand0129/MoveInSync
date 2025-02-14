// Controllers and Middlewares
const auth_controller = require("../controllers/auth.controller");
const auth_middleware = require("../middlewares/auth.middleware");

// Authentication Routes
module.exports = (app) => {
  app.post("/user/signup", [auth_middleware.verifySignUpbody], auth_controller.signup);
  app.post("/user/login", [auth_middleware.verifySignInBody], auth_controller.login);
  app.post("/user/changePassword", [auth_middleware.verifyChangePasswordBody], auth_controller.changePassword);
};
