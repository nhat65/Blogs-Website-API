import { Request, Response } from "express";
import { doHash, doHashValidation } from "../utils/hashing";
import jwt from "jsonwebtoken";
import {
  checkAccountByUsername,
  checkEmail,
  checkUsername,
  createAccount,
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

 export const register = async (req: Request, res: Response): Promise<void> => {
   const { email, username, password } = req.body as {
     email: string;
     username: string;
     password: string;
   };
   try {
     //Check exiting email
     const existingEmail = await checkEmail(email);
     if (existingEmail) {
       res.status(400).json({
         status: false,
         message: "Email already exists.",
       });
       return;
     }
 
     //Check exiting username
     const existingUsername = await checkUsername(username);
     if (existingUsername) {
       res.status(400).json({
         status: false,
         message: "Username already exists.",
       });
       return;
     }
 
     //Hash password
     const hashedPassword = await doHash(password, 10);
 
     //Create account
     const result = await createAccount(username, hashedPassword, email, "user");
 
     if (!result) {
       res.status(400).json({
         status: false,
         message: "Register failed.",
       });
     }
 
     res.status(201).json({
       success: true,
       message: "Register successfully",
     });
   } catch (error) {
     res.status(500).json({
       success: false,
       message: "Register failed!",
     });
   }
 };

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res
    .clearCookie('Authorization')
    .status(200)
    .json({ success: true, message: 'Logout successfully!' });
};