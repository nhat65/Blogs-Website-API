import pool from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getFirstElement } from "../utils/getFirstElement";

interface Account extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
}

export const checkAccountByUsername = async (
  username: string
): Promise<Account | undefined> => {
  const [existingAccount] = await pool.query<Account[]>(
    `SELECT * FROM account WHERE username = ?`,
    [username]
  );

  const account = getFirstElement<Account>(existingAccount);
  if (!account) {
    return undefined;
  }
  return account;
};

export const checkEmail = async (
  email: string
): Promise<String | undefined> => {
  const [existingEmail] = await pool.query<Account[]>(
    `SELECT email FROM account WHERE email = ?`,
    [email]
  );

  const emailAccount = getFirstElement(existingEmail);
  if (!emailAccount) {
    return undefined;
  }
  return emailAccount.email;
};

export const checkUsername = async (
  username: string
): Promise<String | undefined> => {
  const [existingUsername] = await pool.query<Account[]>(
    `SELECT username FROM account WHERE username = ?`,
    [username]
  );

  const usernameAccount = getFirstElement(existingUsername);
  if (!usernameAccount) {
    return undefined;
  }
  return usernameAccount.username;
};

 export const createAccount = async (
   username: string,
   password: string,
   email: string,
   role: string
 ): Promise<Boolean> => {
   const [result] = await pool.query<ResultSetHeader>(
     `INSERT INTO account (username, password, email, role) VALUES (?, ?, ?, ?)`,
     [username, password, email, role]
   );
   //Check insert successfully
   if (!result.affectedRows) {
     return false;
   }
   return true;
 };
