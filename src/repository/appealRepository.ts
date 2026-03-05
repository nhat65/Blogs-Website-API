import { AppealStatus, AppealTypes, PostStatus } from '../constant/enum';
import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface AppealPayload {
  type: AppealTypes;
  userId: number;
  postId: number;
  reason: string;
  message: string;
}

interface Appeal extends RowDataPacket {
  type: AppealTypes;
  postId: number;
  reason: string;
  message: string;
  post_slug: string;
  tag_slug: string;
  post_title: string;
}

export const insertPostAppeal = async (appeal: AppealPayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO appeal(type, user_id, post_id, reason, message) VALUES(?, ?, ?, ?, ?)`,
      [AppealTypes.POST, appeal.userId, appeal.postId, appeal.reason, appeal.message],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const getUserAppealbyUserId = async (userId: number): Promise<Appeal[] | undefined> => {
  try {
    const [appeals] = await pool.query<Appeal[]>(
      `SELECT a.id, a.type, a.reason, a.message, a.status, a.created_at, p.title AS post_title, p.slug AS post_slug, t.slug AS tag_slug
        FROM appeal a
        JOIN post p ON a.post_id = p.id
        JOIN tag t ON p.tag_id = t.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC`,
      [userId],
    );

    return appeals.length ? appeals : undefined;
  } catch (error) {
    return undefined;
  }
};

export const getAllAppeal = async (): Promise<Appeal[] | undefined> => {
  try {
    const [appeals] = await pool.query<
      Appeal[]
    >(`SELECT a.id, a.type, a.reason, a.message, a.status, a.created_at, p.title AS post_title, p.slug AS post_slug, t.slug AS tag_slug
        FROM appeal a
        JOIN post p ON a.post_id = p.id
        JOIN tag t ON p.tag_id = t.id
        ORDER BY a.created_at DESC`);

    return appeals.length ? appeals : undefined;
  } catch (error) {
    return undefined;
  }
};

export const rejectAppealById = async (appealId: number, userId: number): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE appeal SET status = ?, resolved_by = ? WHERE id = ?`,
      [AppealStatus.REJECTED, userId, appealId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const resolveAppealById = async (appealId: number, userId: number): Promise<boolean> => {
  await pool.query('START TRANSACTION');
  try {
    await pool.query<ResultSetHeader>(
      `UPDATE post SET status = ? WHERE id = (SELECT post_id FROM appeal WHERE id = ?)`,
      [PostStatus.POSTED, appealId],
    );

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE appeal SET status = ?, resolved_by = ? WHERE post_id IN (SELECT post_id FROM appeal WHERE id = ?)`,
      [AppealStatus.RESOLVED, userId, appealId],
    );

    await pool.query('COMMIT');

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};
