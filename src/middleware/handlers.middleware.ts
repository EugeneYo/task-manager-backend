import mongoose from "mongoose";
import CustomError from "@class/CustomError";
import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import { MongoError } from "mongodb";

// A wrapper function to wrap async function
// focus on returning all the error thrown into next()
// which will lead to the ErrorRequestHandler
export const wrapper = (controllerFunction: (req: Request, res: Response, next: NextFunction) => any) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await controllerFunction(req, res, next);
		} catch (err) {
			next(err);
		}
	};
};

// Handles all the errors thrown
// CustomError, MangoError, JWT error, others undiscovered error
export const errorHandler: ErrorRequestHandler = async (err: unknown, req, res, next) => {
	if (err instanceof CustomError) {
		res.status(err.statusCode).send({ error: err.message });
	} else if (err instanceof MongoError) {
		res.status(400).send({ err });
	} else if (err instanceof JsonWebTokenError) {
		res.status(401).send({ error: "Unauthorized Access" });
	} else {
		// console.log(err);
		res.status(500).send(err);
	}
};
