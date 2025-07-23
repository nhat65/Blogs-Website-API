import { deleteImage } from "../utils/deleteImage";
import { AuthRequest } from "../middleware/identify";
import { insertUser } from "../repository/userRepository";
import { Request, Response } from "express";

export const createUser = async (req: AuthRequest, res: Response) => {
  const { fullName, bio, country } = req.body as {
    fullName: string;
    bio: string | null;
    country: string;
  };
  const avatarUrl: string | null = req.body.imageUrl || null;
  const accountId: number | undefined = req.user?.accountId;
  const joinedAt: Date = new Date();
  try {
    const userPayload = {
        fullName,
        bio,
        avatarUrl,
        country,
        joinedAt,
        accountId
    }
    const result = await insertUser(userPayload);
    if (!result) {
        deleteImage(avatarUrl, accountId)
          res.status(400).json({
            status: false,
            message: "Create user failed.",
          });
          return
        }
    
        res.status(201).json({
          success: true,
          message: "Create user successfully",
        });
  } catch (error) {
    deleteImage(avatarUrl, accountId)
    res.status(500).json({
      success: false,
      message: "Create user failed!",
    });
  }
};
