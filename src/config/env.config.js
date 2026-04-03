const DB_URL = process.env.MONGO_DB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_COOKIE_EXPIRE = process.env.JWT_COOKIE_EXPIRE;
const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;
const CLOUD_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUD_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

export {
    DB_URL,
    JWT_SECRET,
    JWT_COOKIE_EXPIRE,
    NODE_ENV,
    PORT,
    CLOUD_SECRET,
    CLOUD_KEY,
    CLOUD_NAME
}