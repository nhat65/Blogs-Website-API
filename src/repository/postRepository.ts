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
