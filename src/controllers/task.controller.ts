// const Task = require("../../models/task");
import Task from "@models/task.model";
import { Request, Response } from "express";

// GET /tasks/?completed=true
// GET /tasks/?limit=3&page=4
// GET /tasks/?sortBy=createdAt:desc
const getAllTasks = async (req: Request, res: Response) => {
	const sort: {
		[index: string]: number | undefined;
		createdAt?: number;
		updatedAt?: number;
		completed?: number;
	} = {};

	const options: {
		limit?: number;
		skip?: number;
		sort?: typeof sort;
	} = {};

	const match: {
		completed?: boolean;
	} = {};

	if (req.query.completed) {
		match.completed = req.query.completed === "true";
	}
	if (req.query.limit) {
		options.limit = parseInt(req.query.limit as string);
		options.skip = parseInt(req.query.page as string) * options.limit;
	}

	if (req.query.sortBy) {
		const sort_property = req.query.sortBy as string;
		const property = sort_property.split(":");
		// createdAt : -1 ==> return latest, 1 ==> return oldest
		// updatedAt : -1 ==> return latest, 1 ==> return oldest
		// completed : -1 ==> return true first 1==> return false
		sort[property[0]] = property[1] === "desc" ? -1 : 1;
		options.sort = sort;
	}

	try {
		await req.user
			?.populate({
				path: "tasks",
				match,
				options,
			})
			.execPopulate();
		res.status(200).send(req.user?.tasks);
	} catch (e) {
		res.status(500).send();
	}
};

const createNewTask = async (req: Request, res: Response) => {
	const new_task = new Task({ ...req.body, author: req.user?._id });

	try {
		await new_task.save();
		res.status(201).send(new_task);
	} catch (e) {
		res.status(500).send();
	}
};

const getCurrentTask = async (req: Request, res: Response) => {
	const _id = req.params.id;
	try {
		const current_task = await Task.findOne({ _id, author: req.user?._id });
		!current_task && res.status(400).send();

		res.status(200).send(current_task);
	} catch (e) {
		res.status(500).send();
	}
};

const updateCurrentTask = async (req: Request, res: Response) => {
	const properties = Object.keys(req.body);
	const authorizedUpdates = Object.keys(Task.schema.obj);
	const isValid = properties.every((property) => authorizedUpdates.includes(property));
	if (!isValid) return res.status(400).send({ error: "Invalid Updates" });

	const _id = req.params.id;
	try {
		const current_task = await Task.findOne({ _id, author: req.user?._id });
		if (!current_task) return res.status(404).send();
		properties.forEach((property) => (current_task[property] = req.body[property]));

		await current_task?.save();

		res.status(200).send(current_task);
	} catch (e) {
		res.status(400).send();
	}
};

const deleteCurrentTask = async (req: Request, res: Response) => {
	const _id = req.params.id;
	try {
		const current_task = await Task.findOne({ _id, author: req.user?._id });
		if (!current_task) return res.status(404).send();
		current_task.remove();
		res.status(200).send(current_task);
	} catch (e) {
		res.status(500).send();
	}
};

export { getAllTasks, createNewTask, getCurrentTask, updateCurrentTask, deleteCurrentTask };
