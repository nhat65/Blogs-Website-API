import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { getFirstElement } from '../utils/getFirstElement';

interface Tag extends RowDataPacket {
  id: number;
  tagName: string;
  slug: string;
}

interface TagPayload {
  name: string;
  slug: string;
  createBy: number | null;
}

interface TagUpdatePayload {
  tagId: number;
  name: string;
  slug: string;
  updateBy: number | null;
}

export const getAllTags = async (): Promise<Tag[] | undefined> => {
  try {
    const [tags] = await pool.query<
      Tag[]
    >(`SELECT t.id, t.tag_name, t.slug, t.create_at, COUNT(p.id) AS post_count 
      FROM tag t
      LEFT JOIN post p ON t.id = p.tag_id
      GROUP BY t.id`);

    return tags.length ? tags : undefined;
  } catch (error) {
    return undefined;
  }
};

export const insertTag = async (tag: TagPayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO tag (tag_name, slug, create_by) VALUES (?, ?, ?)',
      [tag.name, tag.slug, tag.createBy],
    );
    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const deleteTagById = async (id: number): Promise<boolean> => {
  await pool.query('START TRANSACTION');
  try {
    await pool.query<ResultSetHeader>(`DELETE FROM post WHERE tag_id = ?`, [id]);

    const [result] = await pool.query<ResultSetHeader>('DELETE FROM tag WHERE id = ?', [id]);

    await pool.query('COMMIT');

    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const getTagById = async (tagId: number): Promise<Tag | undefined> => {
  try {
    const [result] = await pool.query<Tag[]>('SELECT * FROM tag WHERE id = ?', [tagId]);
    return getFirstElement(result);
  } catch (error) {
    return undefined;
  }
};

export const updateTagById = async (tag: TagUpdatePayload): Promise<boolean> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE tag SET tag_name = ?, slug = ?, update_by = ? WHERE id = ?',
      [tag.name, tag.slug, tag.updateBy, tag.tagId],
    );
    return !!result.affectedRows;
  } catch (error) {
    return false;
  }
};

export const getTagIdBySlug = async (slug: string): Promise<number | undefined> => {
  try {
    const [tagId] = await pool.query<Tag[]>(`SELECT id FROM tag WHERE slug = ?`, [slug]);

    return getFirstElement(tagId)?.id;
  } catch (error) {
    return undefined;
  }
};
