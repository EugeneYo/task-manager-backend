import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUserDocument } from "@models/user.model";
import { JSON_WEB_TOKEN_SECRET } from "@config/config";

// Add two fields/properties to the Request interface
declare module "express-serve-static-core" {
	interface Request {
		user?: IUserDocument;
		token?: string;
	}
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		// const token = req.headers.authorization?.replace("Bearer", "");
		const { _id }: any = jwt.verify(token as string, JSON_WEB_TOKEN_SECRET);
		const user = await User.findOne({ _id, "tokens.token": token });
		if (!user) throw new Error();

		req.user = user;
		req.token = token;
		next();
	} catch (err) {
		res.status(401).send({ error: "Unauthorized Access." });
	}
};

export default auth;
