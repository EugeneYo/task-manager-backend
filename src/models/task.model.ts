// const mongoose = require("mongoose");
// const validator = require("validator");

import { Document, Model, Schema, model, HookNextFunction, LeanDocument } from "mongoose";
import CustomError from "@class/CustomError";
export interface ITask {
	// [index: string]: any;
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
			required: [true, "Description is required"],
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

TaskSchema.post("save", function (error: any, doc: ITaskDocument, next: HookNextFunction) {
	let errorMessage: string;
	if (error.name === "ValidationError") {
		let temp_message: string[] = [];
		for (let field in error.errors) {
			temp_message.push(error.errors[field].message);
		}
		// Description is required
		errorMessage = temp_message.join(". ");
	} else {
		errorMessage = error;
	}
	next(new CustomError(400, errorMessage));
});

const Task = model<ITaskDocument, ITaskModel>("Task", TaskSchema);

export default Task;
