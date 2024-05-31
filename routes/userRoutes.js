const express = require("express");
const user = express();
const router = express.Router();
const UserController = require("../controllers/userController");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const incomingfileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return cb(new Error("Please upload a CSV file"), false);
  }
  cb(null, true);
};
const upload = multer({
  storage,
  fileFilter: incomingfileFilter,
});

//PUBLIC ROUTES
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);
router.get("/alldata", UserController.allData);
router.put("/update?:id", UserController.updateData);
router.get("/all-users", UserController.uploadData);
router.get("/active-user", UserController.isActiveUploadData);
router.get("/inactive-user", UserController.isInActiveUploadData);
router.put("/deleterestore", UserController.softDeleteAndRestore);
router.put("/uploadimage?:id", UserController.uploadImg);
router.delete("/permanentdelete?:id", UserController.userDelete);
router.post("/importcsv", upload.single("file"), UserController.uploadCsvData);

module.exports = router;
