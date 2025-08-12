import { Request, Response } from 'express';
import { z } from 'zod';
import userService from '@/services/userService';
import { comparePassword } from '@/utils/password';
import { changePasswordSchema, updateProfileSchema } from '@/validation/authSchemas';

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id as string;
    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    });
  } catch (_error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const parsed = updateProfileSchema.parse(req.body);
    const userId = req.user?.id as string;

    const user = await userService.updateProfile(userId, parsed);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = changePasswordSchema.parse(req.body);
    const userId = req.user?.id as string;

    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const isValid = await comparePassword(parsed.currentPassword, user.password);
    if (!isValid) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    await userService.updatePassword(userId, parsed.newPassword);
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
}