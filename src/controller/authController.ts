import { Request, Response } from 'express';
import { doHash, doHashValidation } from '../utils/hashing';
import jwt from 'jsonwebtoken';
import {
  checkEmail,
  checkUsername,
  createAccount,
  getAccountByUsername,
} from '../repository/authRepository';
import { Role } from '../constant/enum';
import { getUserIdByAccountId } from '../repository/userRepository';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };
  try {
    const account = await getAccountByUsername(username);
    if (!account) {
      res.status(404).json({
        success: false,
        message: 'Username does not exist',
      });
      return;
    }

    const passwordValidation = await doHashValidation(password, account.password);
    if (!passwordValidation) {
      res.status(401).json({
        success: false,
        message: 'Wrong password!',
      });
      return;
    }

    const userId = await getUserIdByAccountId(account.id);
    const token = jwt.sign(
      {
        accountId: account.id,
        username: account.username,
        role: account.role,
      },
      process.env.TOKEN_SECRET as string,
      { expiresIn: '8h' },
    );

    res
      .cookie('Authorization', 'Bearer ' + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        success: true,
        token,
        user: {
          userId: userId,
          role: account.role,
        },
        message: 'Login successfully!',
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Login failed!',
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body as {
    email: string;
    username: string;
    password: string;
  };
  const role: Role = Role.USER;
  const createBy: number | null = null;
  try {
    const existingEmail = await checkEmail(email);
    if (existingEmail) {
      res.status(400).json({
        status: false,
        message: 'Email already exists.',
      });
      return;
    }

    const existingUsername = await checkUsername(username);
    if (existingUsername) {
      res.status(400).json({
        status: false,
        message: 'Username already exists.',
      });
      return;
    }

    const hashedPassword = await doHash(password, 10);

    const accountPayload = {
      username,
      hashedPassword,
      email,
      role,
      createBy,
    };

    const result = await createAccount(accountPayload);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Register failed.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Register successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '[Register] Request failed!',
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res
    .clearCookie('Authorization')
    .status(200)
    .json({ success: true, message: 'Logout successfully!' });
};
