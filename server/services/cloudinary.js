import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dxa5xdosh";
const apiKey = process.env.CLOUDINARY_API_KEY || "782579146525493";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "wFxvljSka_P2D7kGu0vOaJl7jB0";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
