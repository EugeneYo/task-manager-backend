// const mongoose = require("mongoose");
// const validator = require("validator");

import { Document, Model, Schema, model, HookNextFunction, LeanDocument } from "mongoose";

export interface ITask {
	[index: string]: any;
	description: string;
	completed: boolean;
	author: Schema.Types.ObjectId;
}

interface ITaskDocument extends ITask, Document {}
interface ITaskModel extends Model<ITaskDocument> {}

const TaskSchema = new Schema<ITaskDocument, ITaskModel>(
	{
		description: {
			type: String,
			required: true,
			trim: true,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		author: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "User", // same string when create model
		},
	},
	{
		collection: "tasks",
		timestamps: true,
	}
);

const Task = model<ITaskDocument, ITaskModel>("Task", TaskSchema);

export default Task;
