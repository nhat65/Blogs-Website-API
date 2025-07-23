import express, { Request, Response } from 'express';
import 'dotenv/config'

import authRouter from './router/authRouter'
import postRouter from './router/postRouter'
import userRouter from './router/userRouter'

import multer from 'multer';

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
