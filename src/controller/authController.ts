import { Request, Response } from "express";
import { doHash, doHashValidation } from "../utils/hashing";
import jwt from "jsonwebtoken";
import pool from "../config/database";
import { RowDataPacket } from "mysql2";

interface Account extends RowDataPacket {
  username: string;
  password: string;
  role: string;
}

//Login
export const Login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };
  try {
    //Check account exit
    const [existingAccount] = await pool.query<Account[]>(`SELECT * FROM account WHERE username = ?`, [username])
    if(existingAccount.length <= 0){
        res.status(404).json({
            status: false,
            message: 'Account does not exist'
        });
        return;
    };

    //Check password
    const passwordValidation = await doHashValidation(password, existingAccount[0].password);
    if (!passwordValidation) {
      res.status(401).json({
        success: false,
        message: 'Wrong password!',
      });
      return;
    }

    //Create token
    const token = jwt.sign(
      {
        user_id: existingAccount[0].id,
        username: existingAccount[0].username,
        role: existingAccount[0].role,
      },
      process.env.TOKEN_SECRET as string,
      { expiresIn: '8h' }
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
        message: 'Login successfully!',
      });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const Register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password, confirmPassword} = req.body as {
    email: string,
    username: string,
    password: string,
    confirmPassword: string
  }
  try {
    //Check exiting email
    const [existingEmail] = await pool.query<Account[]>(`SELECT email FROM account WHERE email = ?`, [email])
    if(existingEmail.length > 0){
        res.status(400).json({
            status: false,
            message: 'Email already exists.'
        });
        return;
    };
    //Check exiting username
    const [existingUsername] = await pool.query<Account[]>(`SELECT username FROM account WHERE username = ?`, [username])
    if(existingUsername.length > 0){
        res.status(400).json({
            status: false,
            message: 'Username already exists.'
        });
        return;
    };

    //Hash password
    const hashedPassword = await doHash(password, 10)
    
    const [result] = await pool.query(
      'INSERT INTO account (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, "user"],
    );

    res.status(201).json({
      success: true,
      message: 'Register successfully',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Register failed!'
    });
  }
};

export const Logout = async (_req: Request, res: Response): Promise<void> => {
  res
    .clearCookie('Authorization')
    .status(200)
    .json({ success: true, message: 'Logout successfully!' });
};
