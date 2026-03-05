import { checkEmail, checkUsername, createAccount } from '../repository/authRepository';
import { AuthRequest } from '../middleware/identify';
import { Request, Response } from 'express';
import { doHash, doHashValidation } from '../utils/hashing';
import { getUserByAccountId } from '../repository/userRepository';
import { getAccountById, updatePassword } from '../repository/accountRepository';

export const createAccountByAdmin = async (req: AuthRequest, res: Response) => {
  const { email, username, password, role } = req.body as {
    email: string;
    username: string;
    password: string;
    role: string;
  };
  const accountId: number | undefined = req.user?.accountId;
  let createBy: number | null = null;
  try {
    const existingAdmin = await getUserByAccountId(accountId);
    if (!existingAdmin) {
      res.status(404).json({
        status: false,
        message: 'Admin not found.',
      });
      return;
    }
    createBy = existingAdmin.id;

    const existingEmail = await checkEmail(email);
    if (existingEmail) {
      res.status(400).json({
        status: false,
        message: 'Email already exists.',
      });
      return;
    }

    const existingUsername = await checkUsername(username);
    if (existingUsername) {
      res.status(400).json({
        status: false,
        message: 'Username already exists.',
      });
      return;
    }

    const hashedPassword = await doHash(password, 10);
    const accountPayload = {
      username,
      hashedPassword,
      email,
      role,
      createBy,
    };

    const result = await createAccount(accountPayload);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Create account failed.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Create account successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Account][CreateByAdmin] Request failed!',
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };
  const accountId: number | undefined = req.user?.accountId;
  try {
    const existingAccount = await getAccountById(accountId);
    if (!existingAccount) {
      res.status(404).json({
        status: false,
        message: 'User account not found.',
      });
      return;
    }

    const oldPasswordValidation = await doHashValidation(currentPassword, existingAccount.password);
    if (!oldPasswordValidation) {
      res.status(401).json({
        success: false,
        message: 'Current password is wrong!',
      });
      return;
    }

    const checkNewPassword = currentPassword === newPassword;
    if (checkNewPassword) {
      res.status(401).json({
        success: false,
        message: 'The new password must not be the same as your current password!',
      });
      return;
    }

    const hashedPassword = await doHash(newPassword, 10);
    const changePasswordPayload = {
      hashedPassword,
      accountId,
    };

    const result = await updatePassword(changePasswordPayload);
    if (!result) {
      res.status(400).json({
        status: false,
        message: 'Change password failed.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Change password successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: '[Account][ChangePassword] Request failed!',
    });
  }
};
