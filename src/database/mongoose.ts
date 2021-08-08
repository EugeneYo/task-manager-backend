// const mongoose = require("mongoose");
import mongoose from "mongoose";
import { DATABASE_URL } from "@config/config";
// mongod --dbpath=C:\Users\Eugene\mongodb-data

const connectDB = () => {
	mongoose.set("useNewUrlParser", true);
	mongoose.set("useCreateIndex", true);
	mongoose.set("useFindAndModify", false);
	mongoose.set("useUnifiedTopology", true);

	return mongoose
		.connect(DATABASE_URL)
		.then(() => console.log("Successfully connected to the database "))
		.catch((err) => {
			console.log(err);
			process.exit(1);
		});
};

export default connectDB;

// module.exports = connectDB;
