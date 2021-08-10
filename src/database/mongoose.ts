import mongoose from "mongoose";

const connectDB = (url: string) => {
	mongoose.set("useNewUrlParser", true);
	mongoose.set("useCreateIndex", true);
	mongoose.set("useFindAndModify", false);
	mongoose.set("useUnifiedTopology", true);

	return mongoose.connect(url);
};
export default connectDB;
