import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { getFirstElement } from '../utils/getFirstElement';
import { ReactionType } from '../constant/enum';

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

interface PostUpdatePayload {
  postId: number;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  tagId: number;
  userId: number | undefined;
}

interface Post extends RowDataPacket {
  id: number;
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

interface Reaction extends RowDataPacket {
  reaction: ReactionType;
  userId: number;
  postId: number;
}

interface SchedulePostPayload {
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  publishAt: Date;
  status: string;
  tagId: number;
  userId: number | undefined;
}

export const insertPost = async (post: PostPayload): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO post (title, slug, content, image_url, published_at, status, tag_id, user_id)
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
    ],
  );

  return !!result.affectedRows;
};

export const checkSlug = async (slug: string): Promise<string[] | undefined> => {
  const [result] = await pool.query<Post[]>(`SELECT slug FROM post WHERE slug LIKE ?`, [
    `${slug}%`,
  ]);

  return result.map((post) => post.slug);
};

export const deleteUserPost = async (
  postId: number,
  userId: number | undefined,
): Promise<boolean> => {
  await pool.query('START TRANSACTION');

  try {
    await pool.query<ResultSetHeader>(`DELETE FROM comment WHERE post_id = ?`, [postId]);

    await pool.query<ResultSetHeader>(`DELETE FROM post_reaction WHERE post_id = ?`, [postId]);

    await pool.query<ResultSetHeader>(`DELETE FROM report WHERE post_id = ?`, [postId]);

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM post WHERE id = ? AND user_id = ?`,
      [postId, userId],
    );

    await pool.query('COMMIT');

    return !!result.affectedRows;
  } catch (error) {
    await pool.query('ROLLBACK');
    return false;
  }
};

export const getCommentByPostId = async (postId: number): Promise<Comment[] | undefined> => {
  const [comments] = await pool.query<Comment[]>(
    `SELECT c.id, c.content, c.create_at, u.full_name AS user_name, u.avatar_url AS user_avatar, c.user_id
     FROM comment c 
     JOIN user u ON c.user_id = u.id 
     WHERE c.post_id = ? AND c.parent_id IS NULL
     ORDER BY c.create_at DESC`,
    [postId],
  );

  return comments.length ? comments : undefined;
};

export const getAllPostedPost = async (): Promise<Post[] | undefined> => {
  try {
    const [posts] = await pool.query<Post[]>(
      `SELECT u.id, u.full_name, u.avatar_url, p.id, p.slug, p.title, p.image_url, p.published_at, t.slug AS tag_slug 
    FROM post p 
    JOIN user u ON p.user_id = u.id
    JOIN tag t ON p.tag_id = t.id
    WHERE p.status = 'posted'
    ORDER BY p.published_at DESC;`,
    );

    return posts.length ? posts : undefined;
  } catch (error) {
    return undefined;
  }
};

export const getReactionByPostId = async (
  postId: number,
  userId?: number,
): Promise<
  | {
      likes: number;
      dislikes: number;
      userReaction: ReactionType | null;
    }
  | undefined
> => {
  try {
    const [reactionResults] = await pool.query<RowDataPacket[]>(
      `
      SELECT reaction, COUNT(*) as count
      FROM post_reaction
      WHERE post_id = ?
      GROUP BY reaction
      `,
      [postId],
    );

    let userReaction: ReactionType | null = null;
    if (userId) {
      const [userResult] = await pool.query<RowDataPacket[]>(
        `
        SELECT reaction
        FROM post_reaction
        WHERE post_id = ? AND user_id = ?
        LIMIT 1
        `,
        [postId, userId],
      );
      if (userResult.length > 0) {
        userReaction = getFirstElement(userResult)?.reaction as ReactionType;
      }
    }

    const result = {
      likes: 0,
      dislikes: 0,
      userReaction,
    };
    reactionResults.forEach((row: any) => {
      if (row.reaction === ReactionType.Like) {
        result.likes = row.count;
      } else if (row.reaction === ReactionType.Dislike) {
        result.dislikes = row.count;
      }
    });

    return result;
  } catch (error) {
    return undefined;
  }
};

export const getPostById = async (postId: number): Promise<Post | undefined> => {
  const [post] = await pool.query<Post[]>(`SELECT * FROM post WHERE id = ?`, postId);

  return getFirstElement(post);
};

export const updatePostById = async (updatePost: PostUpdatePayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE post 
  SET title = ?, slug = ?, content = ?, image_url = ?, tag_id = ?
  WHERE id = ? AND user_id = ?`,
      [
        updatePost.title,
        updatePost.slug,
        updatePost.content,
        updatePost.imageUrl,
        updatePost.tagId,
        updatePost.postId,
        updatePost.userId,
      ],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const updatePostSchedule = async (postId: number): Promise<boolean> => {
  const currentDate = new Date();
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE post SET status = 'posted', published_at = ? WHERE id = ?`,
      [currentDate, postId],
    );

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const insertSchedulePost = async (post: SchedulePostPayload): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO post (title, slug, content, image_url, publish_at, status, tag_id, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      post.title,
      post.slug,
      post.content,
      post.imageUrl,
      post.publishAt,
      post.status,
      post.tagId,
      post.userId,
    ],
  );

  return !!result.affectedRows;
};

export const getAllPostSchedule = async (): Promise<number[] | undefined> => {
  const currentDate = new Date();
  try {
    const [posts] = await pool.query<Post[]>(
      `SELECT id FROM post WHERE publish_at <= ? AND status = 'scheduled'`,
      [currentDate],
    );

    return posts.length ? posts.map((post) => Number(post.id)) : undefined;
  } catch (error) {
    return undefined;
  }
};

export const getPostDetailBySlug = async (slug: string): Promise<Post | undefined> => {
  try {
    const [post] = await pool.query<Post[]>(
      `SELECT p.id, p.title, p.published_at, p.image_url, p.content, u.full_name, u.avatar_url, t.id AS tag_id, t.tag_name
       FROM post p
       JOIN user u ON p.user_id = u.id
       JOIN tag t ON p.tag_id = t.id
       WHERE p.slug = ?`,
      [slug],
    );

    return getFirstElement(post);
  } catch (error) {
    return undefined;
  }
};
