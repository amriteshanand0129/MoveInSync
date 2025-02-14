const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    nickname: {
      type: String,
      required: false,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["RIDER", "DRIVER", "ADMIN"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    contact: {
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
      },
      state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
      },
      postalCode: {
        type: String,
        required: true,
        trim: true,
        maxlength: 6,
      },
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
