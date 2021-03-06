import Task, { ITask } from "@models/task.model";
import { Document, Model, Schema, model, HookNextFunction, LeanDocument } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JSON_WEB_TOKEN_SECRET } from "@config/config";
import CustomError from "@class/CustomError";

export interface IIndexable {
	[index: string]: any;
}

export interface IUser {
	// [index: string]: any; // string type index signature
	name: string;
	email: string;
	password?: string;
	age?: number;
	tokens?: { token: string }[];
	tasks?: { task: ITask }[];
}

// Each document
export interface IUserDocument extends IUser, Document {
	generateAuthToken: () => Promise<string>;
	getPublic: () => LeanDocument<IUserDocument>;
}

// This model
interface IUserModel extends Model<IUserDocument> {
	findByCredentials: (email: string, password: string) => Promise<IUserDocument>;
}

const UserSchema = new Schema<IUserDocument, IUserModel>(
	{
		name: {
			type: String,
			required: [true, "A username is required"],
			trim: true,
			unique: true,
		},
		email: {
			type: String,
			required: [true, "An email is required"],
			unique: true,
			trim: true,
			validate(value: IUserDocument["email"]) {
				if (!validator.isEmail(value)) throw new Error("Invalid Email");
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minLength: [6, "Password must be at least 6 characters long"],
			validate(value: IUserDocument["password"]) {
				if (value!.toLowerCase().includes("password")) throw new Error("Password cannot contain 'password'");
			},
		},
		age: {
			type: Number,
			default: 0,
			min: [0, "Age cannot be negative"],
			validate(value: IUserDocument["age"]) {
				if (value! < 0) throw new Error("Age cannot be negative");
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
	},
	{
		collection: "users",
		timestamps: true,
	}
);

// Each document is an instance of its Model.
// The Model class is a subclass of the Document class.
// When you use the Model constructor, you create a new document.

// methods are defined on the document(instance).
UserSchema.methods.generateAuthToken = async function () {
	const user = this as IUserDocument;
	const token = jwt.sign({ _id: user._id.toString() }, JSON_WEB_TOKEN_SECRET, {});
	user.tokens = user.tokens?.concat({ token });
	await user.save();
	return token;
};

// Virtual : data populated on fly
UserSchema.virtual("tasks", {
	ref: "Task",
	localField: "_id",
	foreignField: "author",
});

// UserSchema.methods.toJSON = function () {
// 	const user = this;
// 	const publicProfile = user.toObject();

// 	publicProfile.password = "";
// 	delete publicProfile.tokens;

// 	console.log(publicProfile);

// 	return publicProfile;
// };

UserSchema.methods.getPublic = function () {
	const user = this as IUserDocument;
	const publicProfile = user.toObject();

	delete publicProfile.__v;
	delete publicProfile.password;
	delete publicProfile.tokens;
	return publicProfile;
};
// statics are the methods defined on the Model.
UserSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) throw new CustomError(404, "User has not registered yet");

	const isMatch = await bcrypt.compare(password, user.password!);
	if (!isMatch) throw new CustomError(403, "Access denied");

	return user;
};

// Mongoose middleware
// hash the password upon save()
UserSchema.pre("save", async function (next: HookNextFunction) {
	const user = this as IUserDocument;

	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password!, 10);
	}
	next();
});

// Throw errors raised after saving the user
UserSchema.post("save", function (error: any, doc: IUserDocument, next: HookNextFunction) {
	let errorMessage: string;
	if (error.code == 11000) {
		const field = Object.keys(error.keyValue)[0];
		// Name already exists
		errorMessage = field.charAt(0).toUpperCase() + field.slice(1) + " already exists";
	} else if (error.name === "ValidationError") {
		let temp_message: string[] = [];
		for (let field in error.errors) {
			temp_message.push(error.errors[field].message);
		}
		// A username is required. An email is required
		errorMessage = temp_message.join(". ");
	} else {
		errorMessage = error;
	}
	next(new CustomError(400, errorMessage));
});

// Delete user tasks when the user is removed
UserSchema.pre("remove", async function (next: HookNextFunction) {
	const user = this as IUserDocument;
	await Task.deleteMany({ author: user._id });
	next();
});

const User = model<IUserDocument, IUserModel>("User", UserSchema);

export default User;
