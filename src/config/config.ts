// Assert the type for process.env so it will not return undefined
export const { PORT, DATABASE_URL, DATABASE_URL_LOCAL, JSON_WEB_TOKEN_SECRET } = process.env as { [key: string]: string };
