import "dotenv/config";
import { z } from "zod";
import ApiError from "../errors/ApiError";

// Define the environment schema with validation
const EnvSchema = z.object({
    // General
    PORT: z.string().default("3000"),
    NODE_ENV: z.enum(["development", "production", "stage"]),
    // Database
    MONGO_URI: z.string(),

    SUPER_ADMIN_EMAIL: z.string(),
    SUPER_ADMIN_PASSWORD: z.string(),

    JWT_SECRET: z.string(),
    JWT_EXPIRY: z.string()
});

// Validate and parse environment variables
const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
    const errorMessage = parsedEnv.error.issues
        .map((issue) => `❌ ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");

    throw new ApiError(500, `Environment variables validation failed:\n${errorMessage}`);
}


const env = parsedEnv.data;
export default env;