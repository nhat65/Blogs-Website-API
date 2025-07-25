import {
  checkEmail,
  checkUsername,
  createAccount,
} from "../repository/authRepository";
import { AuthRequest } from "../middleware/identify";
import { Request, Response } from "express";
import { doHash } from "../utils/hashing";
import { getUserByAccountId } from "../repository/userRepository";

export const createAccountByAdmin = async (req: AuthRequest, res: Response) => {
  const { email, username, password, role } = req.body as {
    email: string;
    username: string;
    password: string;
    role: string;
  };
  const accountId: number | undefined = req.user?.accountId;
  let createBy: number | null = null;
  try {
    const existingUser = await getUserByAccountId(accountId);
    if (!existingUser) {
      res.status(404).json({
        status: false,
        message: "User not found.",
      });
      return;
    }
    createBy = existingUser.id;

    const existingEmail = await checkEmail(email);
    if (existingEmail) {
      res.status(400).json({
        status: false,
        message: "Email already exists.",
      });
      return;
    }

    const existingUsername = await checkUsername(username);
    if (existingUsername) {
      res.status(400).json({
        status: false,
        message: "Username already exists.",
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
        message: "Create account failed.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Create account successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "[Account][CreateByAdmin] Request failed!",
    });
  }
};
