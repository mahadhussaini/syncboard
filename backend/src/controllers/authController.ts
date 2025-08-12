import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import tokenService from '@/services/tokenService';
import userService from '@/services/userService';
import { comparePassword } from '@/utils/password';
import redis from '@/lib/redis';
import logger from '@/utils/logger';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/validation/authSchemas';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerSchema.parse(req.body);

    const existing = await userService.getUserByEmail(parsed.email);
    if (existing) {
      res.status(400).json({ success: false, error: 'Email already in use' });
      return;
    }

    const user = await userService.createUser(parsed);

    const accessToken = tokenService.createAccessToken({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    const refreshToken = await tokenService.createRefreshToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15m
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.parse(req.body);

    const user = await userService.getUserByEmail(parsed.email);
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const valid = await comparePassword(parsed.password, user.password);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const accessToken = tokenService.createAccessToken({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    const refreshToken = await tokenService.createRefreshToken(user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15m
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
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

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const parsed = refreshSchema.parse(req.body);

    const userId = await tokenService.verifyRefreshToken(parsed.refreshToken);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Invalid refresh token' });
      return;
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid refresh token' });
      return;
    }

    const accessToken = tokenService.createAccessToken({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    const newRefreshToken = await tokenService.rotateRefreshToken(parsed.refreshToken, user.id);

    res.status(200).json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: 900,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    res.status(500).json({ success: false, error: 'Token refresh failed' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'refreshToken is required' });
      return;
    }

    await tokenService.revokeRefreshToken(parsed.data.refreshToken);
    res.status(200).json({ success: true, message: 'Logged out' });
  } catch (_error) {
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = forgotPasswordSchema.parse(req.body);

    const user = await userService.getUserByEmail(parsed.email);
    // Regardless of whether a user exists, respond with success to prevent user enumeration
    if (user) {
      const token = randomToken();
      // 1 hour TTL
      await redis.set(`pwdreset:${token}`, user.id, 60 * 60);
      logger.info(`Password reset token (dev): ${token}`);
      res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.', devToken: token });
      return;
    }

    res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = resetPasswordSchema.parse(req.body);

    const userId = await redis.get(`pwdreset:${parsed.token}`);
    if (!userId) {
      res.status(400).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    await userService.updatePassword(userId, parsed.newPassword);
    await redis.del(`pwdreset:${parsed.token}`);

    res.status(200).json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
}

function randomToken(): string {
  // Simple dev token generator
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}