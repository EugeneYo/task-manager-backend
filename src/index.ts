// import "module-alias/register";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config({});

import connectDB from "@database/mongoose";
import { default as userRoute } from "@routes/user.routes";
import { default as taskRoute } from "@routes/task.routes";
import { DATABASE_URL, DATABASE_URL_LOCAL, PORT } from "@config/config";
import { errorHandler } from "@middleware/handlers.middleware";
import swaggerUI from "swagger-ui-express";
import yaml from "yamljs";
const swaggerDoc = yaml.load("./swaggerAPI.yml");

// Configuring the server
const app: Application = express();

// Maintenance
// app.use((req: Request, res: Response, next: NextFunction) => {
// 	res.status(503).send("The site is currently down. Check back soon");
// });

app.use(express.json());
app.use(cors());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
// Routes
app.use(userRoute);
app.use(taskRoute);
app.use((req: Request, res: Response) => {
	res.status(404).send("Route does not exist");
});

// Default error handler for Express send back HTML
// Thus, created custom errorHandler to send json back
// ErrorRequestHandler needs to be the last middleware
app.use(errorHandler);

// Initiate the server
const initiateServer = async () => {
	try {
		await connectDB(DATABASE_URL_LOCAL);
		app.listen(PORT, () => {
			console.log(`Server is up on port ${PORT}`);
		});
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

initiateServer();
