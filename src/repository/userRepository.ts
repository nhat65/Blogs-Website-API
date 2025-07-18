import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/database";
import { getFirstElement } from "../utils/getFirstElement";

interface User extends RowDataPacket {
  id: number;
  fullName: string;
  bio?: string;
  avatar: string;
  joinedAt: Date;
  country: string;
  accountId: number;
}
export const getUserId = async (
  accountId: number | undefined
): Promise<number | undefined> => {
  const [userId] = await pool.query<User[]>(
    `SELECT id FROM user WHERE account_id = ?`,
    [accountId]
  );

  const result = getFirstElement(userId);
  return result?.id;
};
