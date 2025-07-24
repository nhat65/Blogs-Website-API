import { getFirstElement } from "../utils/getFirstElement";
import pool from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface CommentPayload {
  content: string;
  userId: number | undefined;
  postId: number;
  parentId: number | null;
}

interface Comment extends RowDataPacket {
  id: number | undefined;
  content: string;
  userId: number | undefined;
  postId: number;
  parentId: number | null;
}

export const insertComment = async (
  comment: CommentPayload
): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO comment(content, user_id, post_id, parent_id) 
            VALUES (?, ?, ?, ?)`,
      [comment.content, comment.userId, comment.postId, comment.parentId]
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const checkParentComment = async (
  parentId: number,
  postId: number
): Promise<number | undefined> => {
  try {
    const [comment] = await pool.query<Comment[]>(
      `SELECT id FROM comment WHERE id = ? AND post_id = ?`,
      [parentId, postId]
    );

    return getFirstElement(comment)?.id;
  } catch (error) {
    return undefined;
  }
};
