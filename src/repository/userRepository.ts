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

interface UserPayload {
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  joinedAt: Date;
  country: string;
  accountId: number | undefined;
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

export const insertUser = async (user: UserPayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO user(full_name, bio, avatar_url, joined_at, country, account_id) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [user.fullName, user.bio, user.avatarUrl, user.joinedAt, user.country, user.accountId]
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};
