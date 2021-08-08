import auth from "@middleware/auth.middleware";
// const express = require("express");
import express from "express";
const task = express.Router();
import { getAllTasks, createNewTask, getCurrentTask, updateCurrentTask, deleteCurrentTask } from "@controllers/task.controller";

task.route("/tasks").get(auth, getAllTasks);
task.route("/tasks").post(auth, createNewTask);
task.route("/tasks/:id").get(auth, getCurrentTask);
task.route("/tasks/:id").patch(auth, updateCurrentTask);
task.route("/tasks/:id").delete(auth, deleteCurrentTask);

export default task;
