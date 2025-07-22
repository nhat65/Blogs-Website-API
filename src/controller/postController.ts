import { generateSlug } from "../utils/slug";
import { AuthRequest } from "../middleware/identify";
import { Request, Response } from "express";
import { checkSlug, deleteUserPost, insertPost } from "../repository/postRepository";
import { getUserId } from "../repository/userRepository";

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
      res.status(400).json({
        status: false,
        message: "Slug already exists.",
      });
      return;
    }

    userId = await getUserId(req.user?.accountId);
    imageUrl = req.body.imageUrl || null;
    postedAt = new Date();
    status = "posted";

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
      res.status(400).json({
        status: false,
        message: "Create post failed.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Create post successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Create post failed!",
    });
  }
};

export const deleteOwnPost = async (req: AuthRequest, res: Response) => {
 const postId: number = parseInt(req.params.postId);
  let userId: number | undefined;

  try {
    userId = await getUserId(req.user?.accountId);

    const result = await deleteUserPost(postId, userId)

    if (!result) {
      res.status(400).json({
        status: false,
        message: "Delete post failed.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Delete post successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete post failed!",
    });
  }
};