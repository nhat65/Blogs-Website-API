import { ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { getFirstElement } from '../utils/getFirstElement';

interface ReactionPayload {
  userId: number;
  postId: number;
  reactionType: string;
}

interface Reaction extends ResultSetHeader {
  id: number;
  reaction: string;
  userId: number;
  postId: number;
}

export const handleUserReaction = async (reaction: ReactionPayload): Promise<boolean> => {
  try {
    const userReaction = await getUserReaction(reaction.postId, reaction.userId);
    if (userReaction) {
      if (userReaction.reaction === reaction.reactionType) {
        const [result] = await pool.query<ResultSetHeader>(
          'DELETE FROM post_reaction WHERE user_id = ? AND post_id = ?',
          [reaction.userId, reaction.postId],
        );

        return !!result.affectedRows;
      } else {
        const [result] = await pool.query<ResultSetHeader>(
          'UPDATE post_reaction SET reaction = ? WHERE user_id = ? AND post_id = ?',
          [reaction.reactionType, reaction.userId, reaction.postId],
        );

        return !!result.affectedRows;
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO post_reaction(user_id, post_id, reaction) VALUES (?, ?, ?)',
      [reaction.userId, reaction.postId, reaction.reactionType],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const getUserReaction = async (
  postId: number,
  userId: number,
): Promise<Reaction | undefined> => {
  try {
    const [reaction] = await pool.query<Reaction[]>(
      `SELECT id, reaction, user_id, post_id
            FROM post_reaction WHERE post_id = ? AND user_id = ?`,
      [postId, userId],
    );

    return getFirstElement(reaction);
  } catch (error) {
    return undefined;
  }
};
