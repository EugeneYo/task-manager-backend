import Task, { ITask } from "@models/task.model";
import { Document, Model, Schema, model, HookNextFunction, LeanDocument } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JSON_WEB_TOKEN_SECRET } from "@config/config";

interface IUser {
	[index: string]: any; // string type index signature
	name: string;
	email: string;
	password: string;
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
			required: true,
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
				if (value.toLowerCase().includes("password")) throw new Error("Password cannot contain 'password'");
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
	const user = this;

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
	const user = this;
	const publicProfile = user.toObject();

	// publicProfile.password = "";
	delete publicProfile.password;
	delete publicProfile.tokens;

	console.log(publicProfile);

	return publicProfile;
};
// statics are the methods defined on the Model.
UserSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) {
		throw new Error("Unable to Login");
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error("Unable to Login");
	}

	return user;
};

// Mongoose middleware
// hash the password upon save()
UserSchema.pre("save", async function (next: HookNextFunction) {
	const user = this as IUserDocument;

	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 10);
	}
	next();
});
// Delete user tasks when the user is removed
UserSchema.pre("remove", async function (next: HookNextFunction) {
	const user = this;
	await Task.deleteMany({ author: user._id });
	next();
});

const User = model<IUserDocument, IUserModel>("User", UserSchema);

export default User;
