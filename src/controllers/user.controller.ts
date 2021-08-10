import User, { IIndexable } from "@models/user.model";
import { NextFunction, Request, Response } from "express";
import { wrapper } from "@middleware/handlers.middleware";
import CustomError from "@class/CustomError";

const createNewUser = wrapper(async (req: Request, res: Response) => {
	const new_user = new User(req.body);
	await new_user.save();
	const token = await new_user.generateAuthToken(); // document methods
	res.status(201).send({ user: new_user.getPublic(), token });
});

const loginUser = wrapper(async (req: Request, res: Response, next: NextFunction) => {
	const user = await User.findByCredentials(req.body.email, req.body.password); // model statics (methods)
	const token = await user.generateAuthToken(); // document methods
	res.status(200).send({ user: user.getPublic(), token });
});

const logoutUser = wrapper(async (req: Request, res: Response) => {
	req.user!.tokens = req.user!.tokens!.filter((token) => token.token !== req.token);
	await req.user!.save();
	res.status(200).send();
});

const logoutUserAll = wrapper(async (req: Request, res: Response) => {
	req.user!.tokens = [];
	await req.user!.save();
	res.status(200).send();
});

const getProfile = wrapper(async (req: Request, res: Response) => {
	res.status(200).send(req.user!.getPublic());
});

const updateProfile = wrapper(async (req: Request, res: Response) => {
	const properties: string[] = Object.keys(req.body);
	const authorizedUpdates: string[] = Object.keys(User.schema.obj);
	const isValid = properties.every((property) => authorizedUpdates.includes(property));

	if (!isValid) throw new CustomError(400, "Invalid updates");

	properties.forEach((property) => ((req.user as IIndexable)[property] = req.body[property]));
	await req.user!.save();
	res.status(200).send(req.user!.getPublic());
});

const deleteProfile = wrapper(async (req: Request, res: Response) => {
	await req.user!.remove();
	res.status(200).send({ message: "Deleted" });
});

export { createNewUser, getProfile, updateProfile, deleteProfile, loginUser, logoutUser, logoutUserAll };
