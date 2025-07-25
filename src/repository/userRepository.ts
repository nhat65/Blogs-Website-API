import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { getFirstElement } from '../utils/getFirstElement';

interface User extends RowDataPacket {
  id: number;
  fullName: string;
  bio?: string;
  avatarUrl: string;
  country: string;
  accountId: number;
  joinedAt: Date;
}

interface UserPayload {
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  joinedAt: Date;
  country: string;
  accountId: number | undefined;
}

interface UserUpdatePayload {
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  country: string;
  userId: number | undefined;
}

export const getUserIdByAccountId = async (
  accountId: number | undefined,
): Promise<number | undefined> => {
  const [userId] = await pool.query<User[]>(`SELECT id FROM user WHERE account_id = ?`, [
    accountId,
  ]);

  return getFirstElement(userId)?.id;
};

export const insertUser = async (user: UserPayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO user(full_name, bio, avatar_url, joined_at, country, account_id) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [user.fullName, user.bio, user.avatarUrl, user.joinedAt, user.country, user.accountId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const getUserByAccountId = async (
  accountId: number | undefined,
): Promise<User | undefined> => {
  try {
    const [user] = await pool.query<User[]>(`SELECT * FROM user WHERE account_id = ?`, [accountId]);

    return getFirstElement(user);
  } catch (error) {
    return undefined;
  }
};

export const updateUser = async (updateUser: UserUpdatePayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user 
    SET full_name = ?, bio = ?, avatar_url = ?, country = ? 
    WHERE id = ?`,
      [
        updateUser.fullName,
        updateUser.bio,
        updateUser.avatarUrl,
        updateUser.country,
        updateUser.userId,
      ],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};
