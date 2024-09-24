const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, "Please tell us your first name!"],
    minlength: 3,
  },
  mname: {
    type: String,
    required: [true, "Please tell us your middle name!"],
    minlength: 3,
  },
  lname: {
    type: String,
    required: [true, "Please tell us your last name!"],
    minlength: 3,
  },
  state: {
    type: String,
    required: [true, "Please provide your state!"],
  },
  memberId: {
    type: String,
    unique: true,
    required: [true, "Please provide your member Id!"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //  This only worKs on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "Password does not match",
    },
  },
  email: {
    type: String,
    required: [true, "Please provide your email!"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email!"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  maritalStatus: {
    type: String,
    enum: ["single", "married", "divorced"],
    required: [true, "Please provide your marital status!"],
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        // Regular expression to validate phone number
        return /\d{11}/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Please use format 1234567890`,
    },
    required: true,
  },
  secondaryPhoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        // Regular expression to validate phone number
        return /\d{11}/.test(v);
        // return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Please use format XXX-XXX-XXXX`,
    },
  },
  memberSince: {
    type: Number,
    max: new Date().getFullYear(),
    required: true,
    default: Date.now,
  },
  birthDay: {
    type: String,
    required: [true, "Please proved your date of birth"],
    validate: {
      validator: function (value) {
        // Regular expression to validate mm-dd-yyyy format
        return /^(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|3[01])-(19|20)\d{2}$/.test(
          value
        );
      },
      message: "Please provide the date of birth in mm-dd-yyyy format",
    },
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("save", async function (next) {
  // Run only when password is modified
  if (!this.isModified("password")) return next();

  // hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Deleted the passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});


userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(this.passwordChangedAt, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
