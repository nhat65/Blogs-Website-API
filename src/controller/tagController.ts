import { generateSlug } from '../utils/slug';
import {
  deleteTagById,
  getAllTags,
  getTagById,
  insertTag,
  updateTagById,
} from '../repository/tagRepository';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/identify';
import { getUserIdByAccountId } from '../repository/userRepository';

export const getTags = async (req: Request, res: Response) => {
  try {
    const result = await getAllTags();
    if (!result) {
      res.status(404).json({ success: false, message: 'There are no tags!' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Get all tags successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '[Tags][GetAll] Request failed!',
    });
  }
};

export const createTag = async (req: AuthRequest, res: Response) => {
  const { name } = req.body as { name: string };
  const accountId: number | undefined = req.user?.accountId;
  try {
    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    const tagPayload = {
      name,
      slug: generateSlug(name),
      createBy: userId,
    };
    const result = await insertTag(tagPayload);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Create tag failed.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Create tag successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '[Tag][Create] Request failed!',
    });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  const tagId: number = parseInt(req.params.tagId);
  try {
    const result = await deleteTagById(tagId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Delete tag failed.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Delete tag successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '[Tag][Delete] Request failed!',
    });
  }
};

export const updateTag = async (req: AuthRequest, res: Response) => {
  const tagId: number = parseInt(req.params.tagId);
  const { name } = req.body as { name: string };
  const accountId: number | undefined = req.user?.accountId;
  try {
    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    const existingTag = await getTagById(tagId);
    if (!existingTag) {
      res.status(404).json({
        status: false,
        message: 'Tag not found.',
      });
      return;
    }

    const tagPayload = {
      tagId,
      name,
      slug: generateSlug(name),
      updateBy: userId,
    };
    const result = await updateTagById(tagPayload);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Update tag failed.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Update tag successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '[Tag][Update] Request failed!',
    });
  }
};
