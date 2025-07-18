import { Request, Response } from "express";
import { doHash, doHashValidation } from "../utils/hashing";
import jwt from "jsonwebtoken";
import {
  checkAccountByUsername,
  checkEmail,
} from "../repository/authRepository";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };
  try {
    //Check account
    const account = await checkAccountByUsername(username);

    if (!account) {
      res.status(404).json({
        success: false,
        message: "Username does not exist",
      });
      return;
    }

    //Check password
    const passwordValidation = await doHashValidation(
      password,
      account.password
    );
    if (!passwordValidation) {
      res.status(401).json({
        success: false,
        message: "Wrong password!",
      });
      return;
    }

    //Create token
    const token = jwt.sign(
      {
        user_id: account.id,
        username: account.username,
        role: account.role,
      },
      process.env.TOKEN_SECRET as string,
      { expiresIn: "8h" }
    );

    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        success: true,
        token,
        message: "Login successfully!",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
