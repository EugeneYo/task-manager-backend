import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUserDocument } from "@models/user.model";
import { JSON_WEB_TOKEN_SECRET } from "@config/config";
import CustomError from "@class/CustomError";
import { wrapper } from "@middleware/handlers.middleware";

// Add two fields/properties to the Request interface
// just to pass the fields into next middleware
declare module "express-serve-static-core" {
	interface Request {
		user?: IUserDocument;
		token?: string;
	}
}

const auth = wrapper(async (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(" ")[1];
	// const token = req.headers.authorization?.replace("Bearer", "");
	const { _id }: any = jwt.verify(token as string, JSON_WEB_TOKEN_SECRET);
	const user = await User.findOne({ _id, "tokens.token": token });

	if (!user) throw new CustomError(404, "User not found");
	req.user = user;
	req.token = token;
	next();
});

export default auth;
