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
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

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
  async login(loginUserDto: LoginUserDto) {
    const foundUser = await this.prisma.user.findUnique({
      where: { username: loginUserDto.username },
    });
    if (!foundUser)
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    if (foundUser.password !== md5(loginUserDto.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    Reflect.deleteProperty(foundUser, 'password');
    return foundUser;
  }
  async create(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({
      data,
      select: { id: true },
    });
  }
  async updatePassword(passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`,
    );
    if (!captcha)
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    if (captcha !== passwordDto.captcha)
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    const foundUser = await this.prisma.user.findUnique({
      where: { username: passwordDto.username },
    });
    if (!foundUser)
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    foundUser.password = md5(passwordDto.password);
    try {
      await this.prisma.user.update({
        where: { id: foundUser.id },
        data: foundUser,
      });
      return '密码修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '密码修改失败';
    }
  }
}
