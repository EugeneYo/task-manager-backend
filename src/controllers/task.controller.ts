import { IIndexable } from "@models/user.model";
import Task from "@models/task.model";
import { NextFunction, Request, Response } from "express";
import { wrapper } from "@middleware/handlers.middleware";
import CustomError from "@class/CustomError";

// GET /tasks/?completed=true
// GET /tasks/?limit=3&page=4
// GET /tasks/?sortBy=createdAt:desc
const getAllTasks = wrapper(async (req: Request, res: Response) => {
	const sort: {
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
		(sort as IIndexable)[property[0]] = property[1] === "desc" ? -1 : 1;
		options.sort = sort;
	}

	await req
		.user!.populate({
			path: "tasks",
			match,
			options,
		})
		.execPopulate();
	res.status(200).send(req.user!.tasks);
});

const createNewTask = wrapper(async (req: Request, res: Response) => {
	const new_task = new Task({ ...req.body, author: req.user!._id });

	await new_task.save();
	res.status(201).send(new_task);
});

const getCurrentTask = wrapper(async (req: Request, res: Response, next: NextFunction) => {
	const _id = req.params.id;
	if (!_id.match(/^[0-9a-fA-F]{24}$/)) throw new CustomError(400, "Invalid id");
	const current_task = await Task.findOne({ _id, author: req.user!._id });

	if (!current_task) throw new CustomError(404, "Task with given ID can't be found");
	res.status(200).send(current_task);
});

const updateCurrentTask = wrapper(async (req: Request, res: Response) => {
	const properties = Object.keys(req.body);
	const authorizedUpdates = Object.keys(Task.schema.obj);
	const isValid = properties.every((property) => authorizedUpdates.includes(property));
	if (!isValid) throw new CustomError(400, "Invalid updates");

	const _id = req.params.id;
	const current_task = await Task.findOne({ _id, author: req.user!._id });
	if (!current_task) throw new CustomError(404, "Task with the given ID can't be found");

	properties.forEach((property) => ((current_task as IIndexable)[property] = req.body[property]));
	await current_task!.save();
	res.status(200).send(current_task);
});

const deleteCurrentTask = wrapper(async (req: Request, res: Response) => {
	const _id = req.params.id;

	const current_task = await Task.findOne({ _id, author: req.user!._id });
	if (!current_task) throw new CustomError(404, "Task with the given ID can't be found");
	current_task.remove();
	res.status(200).send(current_task);
});

export { getAllTasks, createNewTask, getCurrentTask, updateCurrentTask, deleteCurrentTask };
