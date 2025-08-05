import dotenv from 'dotenv';

dotenv.config();

// Define the shape of the environment configuration
interface EnvConfig {
    PORT: string;
    DATABASE_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
    JWT_SECRET: string;
    JWT_EXPIRY: string;
    LOG_LEVEL: 'info' | 'debug' | 'warn' | 'error';
    // Add more environment variables as needed
}

// Function to load environment variables and validate their existence
const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVars: (keyof EnvConfig)[] = [
        'PORT',
        'DATABASE_URL',
        'NODE_ENV',
        'JWT_SECRET',
        'JWT_EXPIRY',
        'LOG_LEVEL'
    ];

    // Check if all required environment variables are set
    requiredEnvVars.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    });

    // Return the validated environment variables
    return {
        PORT: process.env.PORT || '3000',
        DATABASE_URL: process.env.DATABASE_URL!,
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
        JWT_SECRET: process.env.JWT_SECRET!,
        JWT_EXPIRY: process.env.JWT_EXPIRY || '1h',
        LOG_LEVEL: (process.env.LOG_LEVEL || 'info') as 'info' | 'debug' | 'warn' | 'error'
    };
};

// Call the function to load and validate the environment variables
const env = loadEnvVariables();

// Export the validated environment variables
export default env;
