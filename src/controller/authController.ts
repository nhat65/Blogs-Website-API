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
    console.log(req.body)
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
      message: "Internal server error",
    });
  }
};
