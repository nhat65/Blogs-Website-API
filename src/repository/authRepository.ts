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

interface AccountPayLoad {
  username: string;
  hashedPassword: string;
  email: string;
  role: string;
  createBy: number | null;
}

export const checkAccountByUsername = async (
  username: string
): Promise<Account | undefined> => {
  const [existingAccount] = await pool.query<Account[]>(
    `SELECT * FROM account WHERE username = ?`,
    [username]
  );

  const account = getFirstElement<Account>(existingAccount);
  return account;
};

export const checkEmail = async (
  email: string
): Promise<String | undefined> => {
  const [existingEmail] = await pool.query<Account[]>(
    `SELECT email FROM account WHERE email = ?`,
    [email]
  );

  const result = getFirstElement(existingEmail);
  return result?.email;
};

export const checkUsername = async (
  username: string
): Promise<String | undefined> => {
  const [existingUsername] = await pool.query<Account[]>(
    `SELECT username FROM account WHERE username = ?`,
    [username]
  );

  const result = getFirstElement(existingUsername);
  return result?.username;
};

export const createAccount = async (
  account: AccountPayLoad
): Promise<Boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO account (username, password, email, role, create_by) VALUES (?, ?, ?, ?, ?)`,
    [
      account.username,
      account.hashedPassword,
      account.email,
      account.role,
      account.createBy,
    ]
  );

  return !!result.affectedRows;
};
