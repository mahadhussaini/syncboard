import jwt, { JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { jwtConfig } from '@/config';
import redis from '@/lib/redis';

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 60 * 60 * 24 * 7; // default 7d
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return value;
  }
}

const REFRESH_PREFIX = 'refresh:';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

class TokenService {
  createAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, jwtConfig.secret) as AccessTokenPayload;
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = randomUUID();
    const ttlSeconds = parseDurationToSeconds(jwtConfig.refreshExpiresIn);
    await redis.set(`${REFRESH_PREFIX}${token}`, userId, ttlSeconds);
    return token;
  }

  async verifyRefreshToken(token: string): Promise<string | null> {
    const userId = await redis.get(`${REFRESH_PREFIX}${token}`);
    return userId;
  }

  async rotateRefreshToken(oldToken: string, userId: string): Promise<string> {
    // Revoke old token and issue a new one
    await redis.del(`${REFRESH_PREFIX}${oldToken}`);
    return this.createRefreshToken(userId);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await redis.del(`${REFRESH_PREFIX}${token}`);
  }
}

const tokenService = new TokenService();
export default tokenService;