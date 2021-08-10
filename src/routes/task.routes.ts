import auth from "@middleware/auth.middleware";
// const express = require("express");
import express from "express";
const task = express.Router();
import { getAllTasks, createNewTask, getCurrentTask, updateCurrentTask, deleteCurrentTask } from "@controllers/task.controller";

task.get("/tasks", [auth, getAllTasks]);
task.post("/tasks", [auth, createNewTask]);
task.get("/tasks/:id", [auth, getCurrentTask]);
task.patch("/tasks/:id", [auth, updateCurrentTask]);
task.delete("/tasks/:id", [auth, deleteCurrentTask]);

export default task;
