import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config({});

import connectDB from "@database/mongoose";
import { default as userRoute } from "@routes/user.routes";
import { default as taskRoute } from "@routes/task.routes";
import { PORT, JSON_WEB_TOKEN_SECRET, config } from "@config/config";

// Configuring the server
// const port = process.env.PORT || 5000;
const app: Application = express();

// Maintenance
// app.use((req: Request, res: Response, next: NextFunction) => {
// 	res.status(503).send("The site is currently down. Check back soon");
// });

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(userRoute);
app.use(taskRoute);

app.use((req: Request, res: Response) => {
	res.status(404).send("Route does not exist");
});
// Routes

// Initiate the server
app.listen(PORT, () => {
	console.log(`Server is up on port ${PORT}`);
	connectDB();
});
