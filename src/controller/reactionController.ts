import { handleUserReaction } from '../repository/reactionRepository';
import { AuthRequest } from '../middleware/identify';
import { getPostById } from '../repository/postRepository';
import { getUserIdByAccountId } from '../repository/userRepository';
import { Response, Request } from 'express';

export const handleReaction = async (req: AuthRequest, res: Response) => {
  const { postId, reactionType } = req.body as { postId: number; reactionType: string };
  const accountId: number | undefined = req.user?.accountId;
  try {
    const post = await getPostById(postId);
    if (!post) {
      res.status(404).json({
        status: false,
        message: 'Post not found!',
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

    const reactionPayload = {
      postId,
      userId,
      reactionType,
    };
    const reaction = await handleUserReaction(reactionPayload);
    if (!reaction) {
      res.status(400).json({
        status: false,
        message: 'Failed to handle reaction!',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Reaction handle successfully!',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Reaction][Handle] Request failed!',
    });
  }
};
