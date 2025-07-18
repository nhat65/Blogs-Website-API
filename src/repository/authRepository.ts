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

  const Email = getFirstElement(existingEmail);
  if (!Email) {
    return undefined;
  }
  return Email.email;
};
