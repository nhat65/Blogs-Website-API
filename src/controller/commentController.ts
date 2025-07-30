import { AuthRequest } from '../middleware/identify';
import {
  checkParentComment,
  deleteCommentById,
  getCommentById,
  getCommentCountByPostId,
  getReplysByCommentId,
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
        data: comment,
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
  const accountId: number | undefined = req.user?.accountId;
  const commentId = parseInt(req.params.commentId);
  try {
    const userId = await getUserIdByAccountId(accountId);
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

export const getCommentCount = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  try {
    const count = await getCommentCountByPostId(postId);
    res.status(200).json({
      status: true,
      count,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Comment][GetCount] Request failed!',
    });
  }
};

export const getReplyComments = async (req: Request, res: Response) => {
  const commentId = parseInt(req.params.commentId);
  try {
    const replyComment = await getReplysByCommentId(commentId);
    res.status(200).json({
      status: true,
      message: 'Get reply comments successfully',
      data: replyComment,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Comment][GetReply] Request failed!',
    });
  }
};

export const deleteOwnComment = async (req: AuthRequest, res: Response) => {
  const commentId = parseInt(req.params.commentId);
  const accountId: number | undefined = req.user?.accountId;
  try {
    const comment = await getCommentById(commentId);
    if (!comment) {
      res.status(404).json({
        status: false,
        message: 'Comment not found!',
      });
      return;
    }

    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found!',
      });
      return;
    }

    const result = await deleteCommentById(commentId, userId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Delete comment failed.',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Delete comment successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Comment][Delete] Request failed!',
    });
  }
};
