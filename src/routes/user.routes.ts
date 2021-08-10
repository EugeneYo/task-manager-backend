import express from "express";
const user = express.Router();
import { createNewUser, getProfile, updateProfile, deleteProfile, loginUser, logoutUser, logoutUserAll } from "@controllers/user.controller";
import auth from "@middleware/auth.middleware";

user.post("/users", createNewUser);
user.post("/users/login", loginUser);

// Authorized route
user.post("/users/logout", [auth, logoutUser]);
user.post("/users/logoutAll", [auth, logoutUserAll]);
user.get("/users/me", [auth, getProfile]);
user.patch("/users/me", [auth, updateProfile]);
user.delete("/users/me", [auth, deleteProfile]);

export default user;
