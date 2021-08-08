export const config = {
	PORT: process.env.PORT,
	DATABASE: process.env.DATABASE_URL,
	SECRET: process.env.JSON_WEB_TOKEN_SECRET,
};
export const { PORT, DATABASE_URL, JSON_WEB_TOKEN_SECRET } = <{ [key: string]: string }>process.env;
