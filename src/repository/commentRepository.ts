import { getFirstElement } from "../utils/getFirstElement";
import pool from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface CommentPayload {
  content: string;
  createAt: Date;
  userId: number | undefined;
  postId: number;
  parentId: number | null;
}

interface UpdateCommentPayload {
  commentId: number;
  content: string;
  userId: number | undefined;
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
      `INSERT INTO comment(content, create_at, user_id, post_id, parent_id) 
            VALUES (?, ?, ?, ?, ?)`,
      [
        comment.content,
        comment.createAt,
        comment.userId,
        comment.postId,
        comment.parentId,
      ]
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

export const updateUserComment = async (
  updateComment: UpdateCommentPayload
): Promise<boolean> => {
  try {
    if (updateComment.parentId) {
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE comment SET content = ? WHERE id = ? AND user_id = ? AND parent_id = ?`,
        [updateComment.content, updateComment.commentId, updateComment.userId, updateComment.parentId]
      );
    }
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE comment SET content = ? WHERE id = ? AND user_id = ?`,
      [updateComment.content, updateComment.commentId, updateComment.userId]
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};
