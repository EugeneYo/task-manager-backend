import express from "express";
const user = express.Router();
import { createNewUser, getProfile, updateProfile, deleteProfile, loginUser, logoutUser, logoutUserAll } from "@controllers/user.controller";
import auth from "@middleware/auth.middleware";

user.route("/users").post(createNewUser);
user.route("/users/login").post(loginUser);

// Authorized route
user.route("/users/logout").post(auth, logoutUser);
user.route("/users/logoutAll").post(auth, logoutUserAll);
user.route("/users/me").get(auth, getProfile);
user.route("/users/me").patch(auth, updateProfile);
user.route("/users/me").delete(auth, deleteProfile);

export default user;
