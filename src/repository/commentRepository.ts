import { getFirstElement } from '../utils/getFirstElement';
import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

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

export const insertComment = async (comment: CommentPayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO comment(content, create_at, user_id, post_id, parent_id) 
            VALUES (?, ?, ?, ?, ?)`,
      [comment.content, comment.createAt, comment.userId, comment.postId, comment.parentId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const checkParentComment = async (
  parentId: number,
  postId: number,
): Promise<number | undefined> => {
  try {
    const [comment] = await pool.query<Comment[]>(
      `SELECT id FROM comment WHERE id = ? AND post_id = ?`,
      [parentId, postId],
    );

    return getFirstElement(comment)?.id;
  } catch (error) {
    return undefined;
  }
};

export const updateUserComment = async (updateComment: UpdateCommentPayload): Promise<boolean> => {
  try {
    if (updateComment.parentId) {
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE comment SET content = ? WHERE id = ? AND user_id = ? AND parent_id = ?`,
        [
          updateComment.content,
          updateComment.commentId,
          updateComment.userId,
          updateComment.parentId,
        ],
      );
    }
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE comment SET content = ? WHERE id = ? AND user_id = ?`,
      [updateComment.content, updateComment.commentId, updateComment.userId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const getCommentCountByPostId = async (postId: number): Promise<number> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM comment WHERE post_id = ?`,
      [postId],
    );

    return getFirstElement(result)?.count || 0;
  } catch (error) {
    return 0;
  }
};

export const getReplysByCommentId = async (commentId: number): Promise<Comment[] | undefined> => {
  try {
    const [comments] = await pool.query<Comment[]>(
      `SELECT c.id, c.content, c.create_at, u.full_name AS user_name, u.avatar_url AS user_avatar 
     FROM comment c 
     JOIN user u ON c.user_id = u.id 
     WHERE c.parent_id = ?
     ORDER BY c.create_at`,
      [commentId],
    );

    return comments.length ? comments : undefined;
  } catch (error) {
    return undefined;
  }
};

export const getCommentById = async (commentId: number): Promise<Comment | undefined> => {
  try {
    const [comments] = await pool.query<Comment[]>(`SELECT * FROM comment WHERE id = ?`, [
      commentId,
    ]);

    return getFirstElement(comments);
  } catch (error) {
    return undefined;
  }
};

export const deleteCommentById = async (
  commentId: number,
  userId: number | undefined,
): Promise<boolean> => {
  await pool.query('START TRANSACTION');
  try {
    await pool.query<ResultSetHeader>(`DELETE FROM comment WHERE parent_id = ?`, [commentId]);

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM comment WHERE id = ? AND user_id = ?`,
      [commentId, userId],
    );

    await pool.query('COMMIT');

    return !!result.affectedRows;
  } catch (error) {
    await pool.query('ROLLBACK');
    return false;
  }
};
