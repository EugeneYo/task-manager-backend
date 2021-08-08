export const config = {
	PORT: process.env.PORT,
	SECRET: process.env.JSON_WEB_TOKEN_SECRET,
};
export const { PORT, JSON_WEB_TOKEN_SECRET } = <{ [key: string]: string }>process.env;
