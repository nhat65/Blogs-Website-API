import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRouter from './router/authRouter';
import postRouter from './router/postRouter';
import userRouter from './router/userRouter';
import commentRouter from './router/commentRouter';
import accountRouter from './router/accountRouter';
import tagRouter from './router/tagRouter';
import cookieParser from 'cookie-parser';

import multer from 'multer';
import { getAllPostSchedule } from './repository/postRepository';
import { schedulePostPublication } from './utils/postSchedule';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.use('/api/user', userRouter);
app.use('/api/comment', commentRouter);
app.use('/api/account', accountRouter);
app.use('/api/tags', tagRouter);

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

schedulePostPublication();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
