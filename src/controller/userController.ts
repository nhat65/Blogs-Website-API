import { deleteImage } from '../utils/deleteImage';
import { AuthRequest } from '../middleware/identify';
import {
  deleteUserById,
  getAllUser,
  getUserByAccountId,
  getUserIdByAccountId,
  insertUser,
  lockUserById,
  unlockUserById,
  updateUser,
} from '../repository/userRepository';
import { Request, Response } from 'express';

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
      accountId,
    };
    const result = await insertUser(userPayload);
    if (!result) {
      deleteImage(avatarUrl, accountId);
      res.status(400).json({
        status: false,
        message: 'Create user failed.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Create user successfully',
    });
  } catch (error) {
    deleteImage(avatarUrl, accountId);
    res.status(400).json({
      success: false,
      message: '[User][Create] Request failed!',
    });
  }
};

export const getUserDetail = async (req: AuthRequest, res: Response) => {
  const accountId = req.user?.accountId;
  try {
    const result = await getUserByAccountId(accountId);
    if (!result) {
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Get user detail successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '[User][GetDetail] Request failed!',
    });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  const { fullName, bio, country } = req.body as {
    fullName: string;
    bio: string;
    country: string;
  };
  let userId: number | undefined;
  const accountId: number | undefined = req.user?.accountId;
  const avatarUrl: string | null = req.body.imageUrl || null;
  try {
    userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      deleteImage(avatarUrl, accountId);
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    const userUpdatePayload = {
      fullName,
      bio,
      avatarUrl,
      country,
      userId,
    };

    const result = await updateUser(userUpdatePayload);
    if (!result) {
      deleteImage(avatarUrl, accountId);
      res.status(400).json({
        status: false,
        message: 'Update user failed!',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Update user successfully!',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[User][Update] Request failed!',
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await getAllUser();
    if (!result) {
      res.status(200).json({
        status: false,
        message: 'There is no user.',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Get all user successfully!',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[User][GetAll] Request fail!',
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const adminAccountId = req.user?.accountId;
  try {
    const adminId = await getUserIdByAccountId(adminAccountId);
    if (!adminId) {
      res.status(404).json({
        status: false,
        message: 'User not found!',
      });
      return;
    }

    const result = await deleteUserById(userId, adminId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Delete user fail!',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Delete user successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[User][DeleteByAdmin] Request faild!',
    });
  }
};

export const lockUser = async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const adminAccountId = req.user?.accountId;
  try {
    const adminUserId = await getUserIdByAccountId(adminAccountId);
    if (!adminUserId) {
      res.status(404).json({
        status: false,
        message: 'User not found!',
      });
      return;
    }

    const result = await lockUserById(userId, adminUserId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Lock user fail!',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Lock user successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[User][Lock] Request fail!',
    });
  }
};

export const unlockUser = async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const adminAccountId = req.user?.accountId;
  try {
    const adminUserId = await getUserIdByAccountId(adminAccountId);
    if (!adminUserId) {
      res.status(404).json({
        status: false,
        message: 'User not found!',
      });
      return;
    }

    const result = await unlockUserById(userId, adminUserId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Unlock user fail!',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Unlock user successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[User][Unlock] Request fail!',
    });
  }
};
