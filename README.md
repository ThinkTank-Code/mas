# PrismaXpress - Backend Starter Template

![Version](https://img.shields.io/github/package-json/v/fahimahammed/PrismaXpress)

PrismaXpress is a backend starter template built using **TypeScript**, **Express.js**, **Prisma ORM**, and **PostgreSQL**. It follows a **modular pattern** and includes essential middleware and utility functions, providing a solid foundation for backend development.

## Features

- **TypeScript** for type safety
- **Express.js** for building RESTful APIs
- **Prisma ORM** for database interaction with PostgreSQL
- **Modular project structure** for easy scalability
- **Essential middleware** (CORS, rate limiting, security headers)
- **Logging with Pino**
- **Environment variable management** with dotenv

## Tech Stack

- **TypeScript**: Ensures strong typing and reduces runtime errors.
- **Express.js**: Lightweight and flexible web framework for building REST APIs.
- **Prisma ORM**: A modern ORM for Node.js and TypeScript to interact with PostgreSQL.
- **PostgreSQL**: Powerful open-source relational database.
- **Pino**: A fast and low-overhead logger for Node.js applications.
- **Zod**: A TypeScript-first schema validation library for validation and parsing.
- **dotenv**: Loads environment variables from a `.env` file to configure the app.
- **CORS**: Middleware to allow or restrict resources to be accessed from different origins.
- **express-rate-limit**: Middleware to limit repeated requests to public APIs.
- **helmet**: Helps secure Express apps by setting various HTTP headers.
- **morgan**: HTTP request logger middleware for node.js.

## Requirements

- Node.js >= 20.x
- PostgreSQL (locally or via cloud service)

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/fahimahammed/PrismaXpress.git
cd PrismaXpress
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Setup Environment Variables

Rename `.env.example` to `.env`:
```bash
cp .env.example .env
```


### 4. Prisma Setup

Generate the Prisma client:

```bash
yarn prisma:generate
```

Run Prisma migrations to set up your database schema:

```bash
yarn prisma:migrate
```

### 5. Start Development

To start the development server with hot-reloading:

```bash
yarn dev
```

This will start the server and watch for file changes using `ts-node-dev`.

### 6. Build the Project

To build the project for production:

```bash
yarn build
```

Then, start the built project:

```bash
yarn start
```

## Project Structure

```
./prisma/                       # Prisma-related files
├── migrations/                 # Database migration files
│   └── 20250210110837_init/    # Initial migration file
│       └── migration.sql       # SQL statements for the initial migration
├── schema.prisma               # Prisma schema file that defines the data model
└── migration_lock.toml         # Lock file for Prisma migrations

./src/                          # Source code for the application
├── app.ts                      # Main entry point for the Express app
├── config/                     # Configuration files
│   ├── database.ts             # Database connection setup
│   ├── env.ts                  # Environment variables management
│   └── logger.ts               # Logger configuration (for Pino or similar)
├── errors/                     # Custom error handling
│   ├── ApiError.ts             # API error class for structured error responses
│   └── handleZodError.ts       # Handle errors from Zod schema validation
├── modules/                    # Core modules of the application
│   └── (your module files here) # Add your application modules (controllers, services, routes)
├── server.ts                   # Server setup and middleware configuration
├── types/                      # Type definitions for the app
│   ├── index.d.ts              # Global types and interfaces
│   └── response.interfaces.ts  # Interface for structuring API responses
└── utils/                      # Utility functions
    ├── catchAsync.ts           # Utility to handle async functions and catch errors
    └── sendResponse.ts         # Utility for sending consistent API responses
```

## Available Scripts

- **`dev`**: Runs the server in development mode with `ts-node-dev`.
- **`build`**: Compiles the TypeScript code to JavaScript.
- **`start`**: Starts the server from the `dist` folder after building.
- **`prisma:generate`**: Generates Prisma client based on your schema.
- **`prisma:migrate`**: Applies any pending migrations to your database.
- **`seed`**: Seeds your database with initial data (run via `ts-node prisma/seed.ts`).

## Middleware Included

- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: Using `express-rate-limit` to limit API requests
- **Security Headers**: Using `helmet` to set security-related HTTP headers
- **Request Logging**: Using `morgan` and `pino` for logging requests
