import { AuthRequest } from "../middleware/identify";
import {
  checkParentComment,
  insertComment,
} from "../repository/commentRepository";
import { getPostById } from "../repository/postRepository";
import { getUserByAccountId, getUserId } from "../repository/userRepository";
import { Request, Response } from "express";

export const createComment = async (req: AuthRequest, res: Response) => {
  const {
    content,
    postId,
    parentId = null,
  } = req.body as { content: string; postId: number; parentId: number | null };
  let userId: number | undefined;
  const accountId: number | undefined = req.user?.accountId;
  try {
    userId = await getUserId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: "User not found!",
      });
      return;
    }

    const existingPost = await getPostById(postId);
    if (!existingPost) {
      res.status(404).json({
        status: false,
        message: "Post not found!",
      });
      return;
    }

    if (parentId) {
      const existingParentId = await checkParentComment(parentId, postId);
      if (!existingParentId) {
        res.status(404).json({
          status: false,
          message: "Comment parent not found!",
        });
        return;
      }
    }

    const comment = {
      content,
      userId,
      postId,
      parentId,
    };
    const result = await insertComment(comment);
    if (!result) {
      res.status(400).json({
        status: false,
        message: "Create comment failed!",
      });
      return;
    }

    res.status(201).json({
      status: true,
      message: "Comment successfully.",
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "[Comment][Create] Request failed!",
    });
  }
};
