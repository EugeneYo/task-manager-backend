import User from "@models/user.model";
import { Request, Response } from "express";

const createNewUser = async (req: Request, res: Response) => {
	const new_user = new User(req.body);

	try {
		await new_user.save();
		const token = await new_user.generateAuthToken(); // document methods
		res.status(201).send({ user: new_user.getPublic(), token });
	} catch (err) {
		res.status(500).send(err);
	}
};

const loginUser = async (req: Request, res: Response) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password); // model statics (methods)
		const token = await user.generateAuthToken(); // document methods
		res.status(200).send({ user: user.getPublic(), token });
	} catch (err) {
		res.status(400).send();
	}
};

const logoutUser = async (req: Request, res: Response) => {
	try {
		if (req.user) {
			req.user.tokens = req.user.tokens?.filter((token) => token.token !== req.token);
			await req.user.save();
			res.status(200).send();
		}
	} catch (e) {
		res.status(500).send();
	}
};

const logoutUserAll = async (req: Request, res: Response) => {
	try {
		if (req.user) {
			req.user.tokens = [];
			await req.user.save();
			res.status(200).send();
		}
	} catch (e) {
		res.status(500).send();
	}
};

// Not needed
// const getAllUsers = async (req: Request, res: Response) => {
// 	try {
// 		const all_users = await User.find({});
// 		res.status(200).send(all_users);
// 	} catch (e) {
// 		res.status(500).send();
// 	}
// };

const getProfile = async (req: Request, res: Response) => {
	if (req.user) {
		// const user_public = await req.user.getPublic();
		res.status(200).send(req.user.getPublic());
	}
};

const updateProfile = async (req: Request, res: Response) => {
	const properties: string[] = Object.keys(req.body);
	const authorizedUpdates: string[] = Object.keys(User.schema.obj);

	const isValid = properties.every((property) => authorizedUpdates.includes(property));

	!isValid && res.status(400).send({ error: "Invalid updates" });

	// if (!isValid) return res.status(400).send({ error: "Invalid Updates" });

	try {
		const current_user = req.user!;
		properties.forEach((property) => (current_user[property] = req.body[property]));
		await current_user.save();
		res.status(200).send(current_user.getPublic());
	} catch (e) {
		res.status(400).send();
	}
};

const deleteProfile = async (req: Request, res: Response) => {
	try {
		await req.user?.remove();
		res.status(200).send("Deleted");
	} catch (e) {
		res.status(500).send();
	}
};

export { createNewUser, getProfile, updateProfile, deleteProfile, loginUser, logoutUser, logoutUserAll };
