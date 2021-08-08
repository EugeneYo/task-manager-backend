// const mongoose = require("mongoose");
import mongoose from "mongoose";
// mongod --dbpath=C:\Users\Eugene\mongodb-data

const connectDB = () => {
	mongoose.set("useNewUrlParser", true);
	mongoose.set("useCreateIndex", true);
	mongoose.set("useFindAndModify", false);
	mongoose.set("useUnifiedTopology", true);

	return mongoose
		.connect("mongodb://127.0.0.1:27017/task-manager-api")
		.then(() => console.log("Connected"))
		.catch((e) => {
			console.log(e);
			process.exit(1);
		});
};

export default connectDB;

// module.exports = connectDB;
