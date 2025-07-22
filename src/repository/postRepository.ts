import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/database";
import { getFirstElement } from "../utils/getFirstElement";

interface PostPayload {
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  postedAt: Date;
  status: string;
  tagId: number;
  userId: number | undefined;
}

interface Post extends RowDataPacket {
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  postedAt: Date;
  status: string;
  tagId: number;
  userId: number | undefined;
}

interface Comment extends RowDataPacket {
  content: string;
  userId: number;
  postId: number;
}

enum ReactionType {
  Like = 'like',
  Dislike = 'dislike'
}

interface Reaction extends RowDataPacket {
  reaction: ReactionType,
  userId: number,
  postId: number
}

export const insertPost = async (post: PostPayload): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO post (title, slug, content, image_url, posted_at, status, tag_id, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      post.title,
      post.slug,
      post.content,
      post.imageUrl,
      post.postedAt,
      post.status,
      post.tagId,
      post.userId,
    ]
  );

  return !!result.affectedRows;
};

export const checkSlug = async (
  slug: string
): Promise<string[] | undefined> => {
  const [result] = await pool.query<Post[]>(
    `SELECT slug FROM post WHERE slug LIKE ?`,
    [`${slug}%`]
  );

  return result.map((post) => post.slug);
};

export const deleteUserPost = async (
  postId: number,
  userId: number | undefined
): Promise<boolean> => {
  await pool.query("START TRANSACTION");

  try {
    await pool.query<ResultSetHeader>(`DELETE FROM comment WHERE post_id = ?`, [
      postId,
    ]);

    await pool.query<ResultSetHeader>(
      `DELETE FROM post_reaction WHERE post_id = ?`,
      [postId]
    );

    await pool.query<ResultSetHeader>(`DELETE FROM report WHERE post_id = ?`, [
      postId,
    ]);

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM post WHERE id = ? AND user_id = ?`,
      [postId, userId]
    );

    await pool.query("COMMIT");

    return !!result.affectedRows;
  } catch (error) {
    await pool.query("ROLLBACK");
    return false;
  }
};

export const getCommentByPostId = async (
  postId: number
): Promise<Comment[] | undefined> => {
  const [comments] = await pool.query<Comment[]>(
    `SELECT * FROM comment WHERE post_id = ?`,
    [postId]
  );

  return comments.length ? comments : undefined;
};

export const getAllPost = async (): Promise<Post[] | undefined> => {
  const [posts] = await pool.query<Post[]>(`SELECT * FROM post`);

  return posts.length ? posts : undefined;
};

export const getReactionByPostId = async (
  postId: number
): Promise<Reaction[] | undefined> => {
  const [reaction] = await pool.query<Reaction[]>(
    `SELECT * FROM post_reaction WHERE post_id = ?`,
    [postId]
  );

  return reaction.length ? reaction : undefined;
};
