import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { appRouter } from './presentation/routes/index.js';
import { errorHandler } from './presentation/middlewares/error-handler.middleware.js';

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Application Routes
app.use(appRouter);

// Global Error Handler
app.use(errorHandler);

export { app };
