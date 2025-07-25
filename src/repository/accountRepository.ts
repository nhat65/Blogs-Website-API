import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { Role } from '../constant/enum';
import { getFirstElement } from '../utils/getFirstElement';

interface ChangePasswordPayload {
  hashedPassword: string;
  accountId: number | undefined;
}

interface Account extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  email: string;
  role: Role;
}

export const updatePassword = async (changePassword: ChangePasswordPayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE account SET password = ? WHERE id = ?`,
      [changePassword.hashedPassword, changePassword.accountId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const getAccountById = async (
  accountId: number | undefined,
): Promise<Account | undefined> => {
  try {
    const [user] = await pool.query<Account[]>(
      `SELECT id, username, password, email, role FROM account WHERE id = ?`,
      [accountId],
    );

    return getFirstElement(user);
  } catch (error) {
    return undefined;
  }
};
