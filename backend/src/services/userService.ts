import prisma from '@/lib/prisma';
import { hashPassword } from '@/utils/password';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

class UserService {
  async createUser(input: CreateUserInput) {
    const passwordHash = await hashPassword(input.password);
    return prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateProfile(id: string, data: Partial<{ firstName: string; lastName: string; avatar: string }>) {
    return prisma.user.update({ where: { id }, data });
  }

  async updatePassword(id: string, newPassword: string) {
    const passwordHash = await hashPassword(newPassword);
    return prisma.user.update({ where: { id }, data: { password: passwordHash } });
  }
}

const userService = new UserService();
export default userService;