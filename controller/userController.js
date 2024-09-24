const AppError = require("../utils/appError");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");

const multer = require("multer");
const sharp = require("sharp");

// Save to memory(buffer)
const multerStorage = multer.memoryStorage();

// Test if uploaded file is an image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not and image! Please upload only images.", 400), false);
  }
};

// For image upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("file");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //  1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  //  2) Filtered out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "fname", "lname", "phoneNumber","email");

  //  3) update user document

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.params.id)

   if (!user) {
    return next(new AppError("No user found with that id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});


exports.getAllUsers = catchAsync(async(req,res,next) => {
  const user = await User.find()

  res.status(200).json({
    status: "success",
    results: user.length,
    data: {
      user,
    },
  });
})
