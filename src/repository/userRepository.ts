import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { getFirstElement } from '../utils/getFirstElement';
import { UserStatus } from '../constant/enum';

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
  try {
    const [userId] = await pool.query<User[]>(`SELECT id FROM user WHERE account_id = ?`, [
      accountId,
    ]);

    return getFirstElement(userId)?.id;
  } catch (error) {
    return undefined;
  }
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
    let query = `UPDATE user SET full_name = ?, bio = ?, country = ?`;
    const params: any[] = [updateUser.fullName, updateUser.bio, updateUser.country];
    if (updateUser.avatarUrl !== undefined && updateUser.avatarUrl !== null) {
      query += `, avatar_url = ?`;
      params.push(updateUser.avatarUrl);
    }
    query += ` WHERE id = ?`;
    params.push(updateUser.userId);

    const [result] = await pool.query<ResultSetHeader>(query, params);
    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const getAllUser = async (): Promise<User[] | undefined> => {
  try {
    const [users] = await pool.query<User[]>(
      `SELECT u.id, u.full_name, u.avatar_url, u.joined_at, u.status, a.role, a.email
      FROM user u
      JOIN account a ON u.account_id = a.id
      WHERE u.status IN (?, ?)`,
      [UserStatus.ACTIVED, UserStatus.LOCKED],
    );

    return users.length ? users : undefined;
  } catch (error) {
    return undefined;
  }
};

export const deleteUserById = async (
  userId: number,
  adminId: number | undefined,
): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user SET status = ?, update_by = ?
      WHERE id = ?`,
      [UserStatus.DELETED, adminId, userId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const lockUserById = async (userId: number, adminUserId: number): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user SET status = ?, update_by = ? WHERE id = ?`,
      [UserStatus.LOCKED, adminUserId, userId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const unlockUserById = async (userId: number, adminUserId: number): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user SET status = ?, update_by = ? WHERE id = ?`,
      [UserStatus.ACTIVED, adminUserId, userId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};
