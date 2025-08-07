import { getPostById } from '../repository/postRepository';
import { AuthRequest } from '../middleware/identify';
import { getUserIdByAccountId } from '../repository/userRepository';
import { Request, Response } from 'express';
import {
  dismissReportById,
  getAllReport,
  getReportByUserId,
  insertReport,
  resolveReportById,
} from '../repository/reportRepository';

export const createReport = async (req: AuthRequest, res: Response) => {
  const { content, postId } = req.body as { content: string; postId: number };
  const accountId = req.user?.accountId;
  try {
    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found!',
      });
      return;
    }

    const post = await getPostById(postId);
    if (!post) {
      res.status(404).json({
        status: false,
        message: 'Post not found!',
      });
      return;
    }

    const reportPayload = {
      content,
      userId,
      postId,
    };
    const result = await insertReport(reportPayload);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Report failed!',
      });
      return;
    }

    res.status(201).json({
      status: true,
      message: 'Report successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Report][Create] Request failed!',
    });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const result = await getAllReport();
    if (!result) {
      res.status(204).json({
        status: false,
        message: 'There is no report.',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Get all report successfully.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Report][GetAll] Request failed!',
    });
  }
};

export const dismissReport = async (req: AuthRequest, res: Response) => {
  const reportId = parseInt(req.params.reportId);
  const accountId = req.user?.accountId;
  try {
    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    const result = await dismissReportById(reportId, userId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Dismiss failed!',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Dismiss successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Report][Dismiss] Request failed!',
    });
  }
};

export const resolveReport = async (req: AuthRequest, res: Response) => {
  const reportId = parseInt(req.params.reportId);
  const accountId = req.user?.accountId;
  try {
    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    const result = await resolveReportById(reportId, userId);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Resolve report failed!',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Resolve successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Report][Resolve] Request failed!',
    });
  }
};

export const getUserReport = async (req: AuthRequest, res: Response) => {
  const accountId = req.user?.accountId;
  try {
    const userId = await getUserIdByAccountId(accountId);
    if (!userId) {
      res.status(404).json({
        status: false,
        message: 'User not found.',
      });
      return;
    }

    const result = await getReportByUserId(userId);
    if (!result) {
      res.status(204).json({
        status: false,
        message: 'There is no report.',
      });
      return;
    }

    res.status(200).json({
      status: true,
      mesasge: 'Get user report successfully.',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Report][OfUser] Request failed!',
    });
  }
};
