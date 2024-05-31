const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const CsvParser = require("json2csv").Parser;
const csv = require("csvtojson");
const atob = require("atob");

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, role } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "Email already existed" });
    } else {
      if (name && email && password && password_confirmation && role) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(12);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              role: role,
            });
            console.log(doc, "doc");
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });
            // Generate JWT Token
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.status(201).send({
              status: "success",
              message: "Registration Success",
              token: token,
              user: saved_user,
            });
          } catch (error) {
            console.log(error);
            res.send({ status: "failed", message: "Unable to registered" });
          }
        } else {
          res.send({
            status: "failed",
            message: "password and confirm password is not same",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            //Generate Token
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: "success",
              message: "User is logged in",
              token: token,
              user: user,
              color: "success",
            });
          } else {
            res.send({
              status: "failed",
              message: "Email or Password is not valid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "you are not a registered user",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      res.send({
        status: "failed",
        message: "Unable to Login",
      });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };
  static allData = async (req, res) => {
    let data = await UserModel.find({});
    if (data) {
      res.send(data);
    } else {
      res.send("error");
    }
  };
  static updateData = async (req, resp) => {
    let { user } = req.body;
    const { id } = req.query;
    const { name, email } = req.body;
    if (name && email) {
      try {
        await UserModel.findByIdAndUpdate(id, req.body);
        const saved_user = await UserModel.findOne({ email: email });

        resp.status(200).send({
          status: "success",
          message: "update successfully",
          user: saved_user,
        });
      } catch {
        resp.send({
          status: "failed",
          message: "failed user cannot be updated",
        });
      }
    } else {
      resp.send({
        status: "failed",
        message: "All fields are required",
      });
    }
  };
  static uploadData = async (req, res) => {
    try {
      let users = [];
      let userData = await UserModel.find({});
      userData.forEach((user) => {
        const { name, email } = user;
        users.push({ name, email });
      });
      const csvFields = ["Name", "Email"];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(users);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attatchment:filename=usersData.csv"
      );

      res.status(200).end(csvData);
    } catch (error) {
      res.send({ status: "failed", message: "Cannot Upload File" });
    }
  };
  static isActiveUploadData = async (req, res) => {
    try {
      let users = [];
      let userData = await UserModel.find({});
      userData.forEach((user) => {
        if (user.isActive) {
          const { name, email } = user;
          users.push({ name, email });
        }
      });
      console.log(users, "users");
      const csvFields = ["Name", "Email"];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(users);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attatchment:filename=usersData.csv"
      );

      res.status(200).end(csvData);
    } catch (error) {
      res.send({ status: "failed", message: "Cannot Upload File" });
    }
  };
  static isInActiveUploadData = async (req, res) => {
    try {
      let users = [];
      let userData = await UserModel.find({});
      userData.forEach((user) => {
        if (!user.isActive) {
          const { name, email } = user;
          users.push({ name, email });
        }
      });

      const csvFields = ["Name", "Email"];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(users);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attatchment:filename=usersData.csv"
      );

      res.status(200).end(csvData);
    } catch (error) {
      res.send({ status: "failed", message: "Cannot Upload File" });
    }
  };

  static softDeleteAndRestore = async (req, resp) => {
    let { id, isActive } = req.body;
    if (id) {
      try {
        await UserModel.findByIdAndUpdate(id, { $set: { isActive: isActive } });

        resp.status(200).send({
          status: "success",
          message: "soft delete successfully",
        });
      } catch {
        resp.status(400).send({
          status: "failed",
          message: "could not softdelete the user",
        });
      }
    } else {
      resp.send({
        status: "failed",
        message: "id not defined",
      });
    }
  };

  static userDelete = async (req, resp) => {
    const { id } = req.query;
    if (id) {
      try {
        await UserModel.deleteOne({ _id: id });

        resp.status(200).send({
          status: "success",
          message: "Permanent deleted",
        });
      } catch {
        resp.status(400).send({
          status: "failed",
          message: "could not delete the user",
        });
      }
    } else {
      resp.send({
        status: "failed",
        message: "id not defined",
      });
    }
  };

  static uploadCsvData = (req, res, next) => {
    if (!req.file) {
      return res.status(400).send({
        statue: "failed",
        message: "No file uploaded",
      });
    }
    csv()
      .fromFile(req.file.path)
      .then((jsonObj) => {
        if (jsonObj.length === 0) {
          return res.send({
            statue: "failed",
            message: "csv file is empty",
          });
        }
        const requiredKeys = ["name", "email", "role", "password"];
        for (const obj of jsonObj) {
          for (let key of requiredKeys) {
            if (!(key in obj)) {
              return res.send({
                status: "failed",
                message: `${key} is missing in csv data`,
              });
            }
          }
        }
        const handleAddUsers = async () => {
          const users = [];
          for (let user of jsonObj) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(user["password"], salt);
            users.push({
              name: user["name"],
              email: user["email"],
              role: user["role"],
              password: hashPassword,
            });
          }
          UserModel.insertMany(users)
            .then(() => {
              res.status(200).send({
                status: "success",
                message: "Successfully Uploaded!",
              });
            })
            .catch((error) => {
              res.status(500).send({
                message: "Failed to upload data",
                error,
                status: "failed",
              });
            });
        };
        handleAddUsers();
      })
      .catch((error) => {
        res.status(500).send({
          message: "Failed to parse CSV",
          error,
          status: "failed",
        });
      });
  };

  static uploadImg = async (req, res) => {
    const { id, img } = req.body;

    const decodedImg = atob(img);
    console.log(decodedImg, "SAGAR DI VOTI");
    if (decodedImg.length <= 200000) {
      if (id && img) {
        let data = await UserModel.updateOne(
          { _id: id },
          {
            $set: { img: img },
          }
        );
        console.log(data, "sjhdjhsdjhdsj");
        res.status(200).send({
          status: "success",
          message: "Image uploaded successfully",
          img: img,
        });
      } else {
        res
          .status(400)
          .send({ status: "failed", message: "error in uploading the image" });
      }
    } else {
      res
        .status(400)
        .send({ status: "failed", message: "Image size is too big" });
    }
  };
}

module.exports = UserController;
