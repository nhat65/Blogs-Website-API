import { generateSlug } from '../utils/slug';
import { AuthRequest } from '../middleware/identify';
import { Request, Response } from 'express';
import {
  checkSlug,
  deleteUserPost,
  getAllPostedPost,
  getCommentByPostId,
  getPostById,
  getReactionByPostId,
  insertPost,
  insertSchedulePost,
  updatePostById,
} from '../repository/postRepository';
import { getUserIdByAccountId } from '../repository/userRepository';
import { deleteImage } from '../utils/deleteImage';

export const createPost = async (req: AuthRequest, res: Response) => {
  let { title, slug, content, tagId } = req.body as {
    title: string;
    slug: string;
    content: string;
    tagId: number;
  };
  let imageUrl: string | null = null;
  let status: string;
  let userId: number | undefined;
  let postedAt: Date;
  try {
    if (!slug) {
      slug = generateSlug(title);

      const existingSlug = await checkSlug(slug);
      if (existingSlug) {
        slug = generateSlug(slug, existingSlug);
      }
    }

    const existingSlug = await checkSlug(slug);
    if (existingSlug?.length) {
      deleteImage(imageUrl, req.user?.accountId);
      res.status(400).json({
        status: false,
        message: 'Slug already exists.',
      });
      return;
    }

    userId = await getUserIdByAccountId(req.user?.accountId);
    imageUrl = req.body.imageUrl || null;
    postedAt = new Date();
    status = 'posted';

    const newPost = {
      title,
      slug,
      content,
      imageUrl,
      postedAt,
      status,
      tagId,
      userId,
    };
    const result = await insertPost(newPost);
    if (!result) {
      deleteImage(imageUrl, req.user?.accountId);
      res.status(400).json({
        status: false,
        message: 'Create post failed.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Create post successfully',
    });
  } catch (error) {
    deleteImage(imageUrl, req.user?.accountId);
    res.status(400).json({
      success: false,
      message: '[Post][Create] Request failed!',
    });
  }
};

export const deleteOwnPost = async (req: AuthRequest, res: Response) => {
  const postId: number = parseInt(req.params.postId);
  let userId: number | undefined;

  try {
    userId = await getUserIdByAccountId(req.user?.accountId);
    const result = await deleteUserPost(postId, userId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Delete post failed.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Delete post successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '[Post][Delete] Request failed!',
    });
  }
};

export const getPostComments = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  try {
    const result = await getCommentByPostId(postId);
    if (!result) {
      res.status(404).json({ success: false, message: 'There is no comment!' });
      return;
    }

    res.status(200).json({
      success: false,
      message: 'Get all comment successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get all comment',
    });
  }
};

export const getPostedPosts = async (req: Request, res: Response) => {
  try {
    const result = await getAllPostedPost();
    if (!result) {
      res.status(404).json({ success: false, message: 'There is no post!' });
      return;
    }

    res.status(200).json({
      success: false,
      message: 'Get all post successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '[Post][GetAll] Request failed!',
    });
  }
};

export const getPostReaction = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  try {
    const result = await getReactionByPostId(postId);
    if (!result) {
      res.status(404).json({ success: false, message: 'There is no reaction!' });
      return;
    }

    res.status(200).json({
      success: false,
      message: 'Get post reaction successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to get post reaction',
    });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  let { title, slug, content, tagId } = req.body as {
    title: string;
    slug: string | undefined;
    content: string;
    tagId: number;
  };
  let imageUrl: string | null = req.body.imageUrl || null;
  const postId = parseInt(req.params.postId);
  let userId: number | undefined;
  try {
    if (!slug) {
      slug = generateSlug(title);

      const existingSlug = await checkSlug(slug);
      if (existingSlug) {
        slug = generateSlug(slug, existingSlug);
      }
    }

    const currentPost = await getPostById(postId);
    if (!currentPost) {
      return res.status(404).json({ status: false, message: 'Post not found' });
    }

    if (slug !== currentPost?.slug) {
      const existingSlug = await checkSlug(slug);
      if (existingSlug?.length) {
        deleteImage(imageUrl, req.user?.accountId);
        return res.status(400).json({
          status: false,
          message: 'Slug already exists',
        });
      }
    }

    userId = await getUserIdByAccountId(req.user?.accountId);

    const updatePostPayload = {
      postId,
      title,
      slug,
      content,
      imageUrl,
      tagId,
      userId,
    };

    const result = await updatePostById(updatePostPayload, req.user?.accountId);
    if (!result) {
      deleteImage(imageUrl, req.user?.accountId);
      res.status(400).json({
        status: false,
        message: 'Update post failed.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Update post successfully',
    });
  } catch (error) {
    deleteImage(imageUrl, req.user?.accountId);
    res.status(400).json({
      success: false,
      message: '[Post][Update] Request failed!',
    });
  }
};

export const schedulePost = async (req: AuthRequest, res: Response) => {
  let { title, slug, content, tagId, publishAt } = req.body as {
    title: string;
    slug: string;
    content: string;
    tagId: number;
    publishAt: Date;
  };
  let imageUrl: string | null = null;
  let status: string;
  let userId: number | undefined;
  try {
    if (!slug) {
      slug = generateSlug(title);

      const existingSlug = await checkSlug(slug);
      if (existingSlug) {
        slug = generateSlug(slug, existingSlug);
      }
    }

    const existingSlug = await checkSlug(slug);
    if (existingSlug?.length) {
      deleteImage(imageUrl, req.user?.accountId);
      res.status(400).json({
        status: false,
        message: 'Slug already exists.',
      });
      return;
    }

    userId = await getUserIdByAccountId(req.user?.accountId);
    imageUrl = req.body.imageUrl || null;
    status = 'scheduled';

    const newPost = {
      title,
      slug,
      content,
      imageUrl,
      publishAt,
      status,
      tagId,
      userId,
    };
    const result = await insertSchedulePost(newPost);
    if (!result) {
      deleteImage(imageUrl, req.user?.accountId);
      res.status(400).json({
        status: false,
        message: 'Create post schedule failed.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Create post schedule successfully',
    });
  } catch (error) {
    deleteImage(imageUrl, req.user?.accountId);
    res.status(400).json({
      success: false,
      message: '[Post][Create Schedule] Request failed!',
    });
  }
};
