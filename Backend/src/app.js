import express, { application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

export  { app };