import { AuthRequest } from '../middleware/identify';
import {
  checkParentComment,
  insertComment,
  updateUserComment,
} from '../repository/commentRepository';
import { getPostById } from '../repository/postRepository';
import { getUserByAccountId, getUserIdByAccountId } from '../repository/userRepository';
import { Request, Response } from 'express';

export const createComment = async (req: AuthRequest, res: Response) => {
  const {
    content,
    postId,
    parentId = null,
  } = req.body as { content: string; postId: number; parentId: number | null };
  let userId: number | undefined;
  const accountId: number | undefined = req.user?.accountId;
  const createAt: Date = new Date();
  try {
    userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found!',
      });
      return;
    }

    const existingPost = await getPostById(postId);
    if (!existingPost) {
      res.status(404).json({
        status: false,
        message: 'Post not found!',
      });
      return;
    }

    if (parentId) {
      const existingParentId = await checkParentComment(parentId, postId);
      if (!existingParentId) {
        res.status(404).json({
          status: false,
          message: 'Comment parent not found!',
        });
        return;
      }
    }

    const comment = {
      content,
      createAt,
      userId,
      postId,
      parentId,
    };
    const result = await insertComment(comment);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Create comment failed!',
      });
      return;
    }

    res.status(201).json({
      status: true,
      message: 'Comment successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Comment][Create] Request failed!',
    });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  const {
    content,
    postId,
    parentId = null,
  } = req.body as { content: string; postId: number; parentId: number | null };
  let userId: number | undefined;
  const accountId: number | undefined = req.user?.accountId;
  const commentId = parseInt(req.params.commentId);
  try {
    userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found!',
      });
      return;
    }

    const existingPost = await getPostById(postId);
    if (!existingPost) {
      res.status(404).json({
        status: false,
        message: 'Post not found!',
      });
      return;
    }

    if (parentId) {
      const existingParentId = await checkParentComment(parentId, postId);
      if (!existingParentId) {
        res.status(404).json({
          status: false,
          message: 'Comment parent not found!',
        });
        return;
      }
    }

    const comment = {
      commentId,
      content,
      userId,
      parentId,
    };
    const result = await updateUserComment(comment);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Update comment failed!',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Comment successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Comment][Update] Request failed!',
    });
  }
};
