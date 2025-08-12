import bcrypt from 'bcryptjs';
import { securityConfig } from '@/config';

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(securityConfig.bcryptRounds);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}