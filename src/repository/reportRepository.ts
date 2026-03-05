import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { PostStatus, ReportStatus } from '@/constant/enum';

interface ReportPayload {
  content: string;
  userId: number;
  postId: number;
}

interface Report extends RowDataPacket {
  post_title: string;
  user_full_name: string;
  content: string;
  reported_at: Date;
  post_slug: string;
  tag_slug: string;
}

export const insertReport = async (report: ReportPayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO report(content, user_id, post_id) VALUES(?, ?, ?)`,
      [report.content, report.userId, report.postId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const getAllReport = async (): Promise<Report[] | undefined> => {
  try {
    const [reports] = await pool.query<
      Report[]
    >(`SELECT r.status, r.content, r.id, r.reported_at, p.title AS post_title, p.slug AS post_slug, u.full_name AS user_full_name, t.slug AS tag_slug
      FROM report r
      JOIN post p ON r.post_id = p.id
      JOIN user u ON r.user_id = u.id
      JOIN tag t ON p.tag_id = t.id`);

    return reports.length ? reports : undefined;
  } catch (error) {
    return undefined;
  }
};

export const getReportByUserId = async (userId: number): Promise<Report[] | undefined> => {
  try {
    const [reports] = await pool.query<Report[]>(
      `SELECT r.status, r.content, r.id, r.reported_at, p.title AS post_title, p.slug AS post_slug, t.slug AS tag_slug
      FROM report r
      JOIN post p ON r.post_id = p.id
      JOIN tag t ON p.tag_id = t.id
      WHERE r.user_id = ?`,
      [userId],
    );

    return reports.length ? reports : undefined;
  } catch (error) {
    return undefined;
  }
};

export const dismissReportById = async (reportId: number, userId: number): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE report SET status = ?, resolved_by = ? WHERE id = ?`,
      [ReportStatus.DISMISSED, userId, reportId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const resolveReportById = async (reportId: number, userId: number): Promise<boolean> => {
  await pool.query('START TRANSACTION');
  try {
    await pool.query<ResultSetHeader>(
      `UPDATE post SET status = ?, update_by = ? WHERE id = (SELECT post_id FROM report WHERE id = ?)`,
      [PostStatus.HIDDEN, userId, reportId],
    );

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE report SET status = ?, resolved_by = ? WHERE post_id IN (SELECT post_id FROM report WHERE id = ?)`,
      [ReportStatus.RESOLVED, userId, reportId],
    );

    await pool.query('COMMIT');

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};
