import { PrismaService } from '@app/prisma';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/index';
import { RedisService } from '@app/redis';
import { RegisterUserDto } from './dto/register-user.dto';
import { md5 } from './utils';

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private prisma: PrismaService;

  @Inject(RedisService)
  private redisService: RedisService;
  private logger = new Logger();

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);
    if (!captcha)
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    if (captcha !== user.captcha)
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);

    const foundUser = await this.prisma.user.findUnique({
      where: { username: user.username },
    });
    if (foundUser)
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);

    try {
      return await this.prisma.user.create({
        data: {
          username: user.username,
          password: md5(user.password),
          email: user.email,
        },
        select: {
          id: true,
          username: true,
          email: true,
          createTime: true,
        },
      });
    } catch (e) {
      this.logger.error(e, UserService);
      return null;
    }
  }
  async create(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({
      data,
      select: { id: true },
    });
  }
}
