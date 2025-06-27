import { PrismaService } from '@app/prisma';
import { Inject, Injectable } from '@nestjs/common';
import { AnswerAddDto } from './dto/answer-add.dto';

@Injectable()
export class AnswerService {
  @Inject(PrismaService)
  private prismaService: PrismaService;
  getHello(): string {
    return 'Hello World!';
  }
  async add(dto: AnswerAddDto, userId: number) {
    return this.prismaService.answer.create({
      data: {
        content: dto.content,
        score: 0,
        answerer: {
          connect: { id: userId },
        },
        exam: {
          connect: { id: dto.examId },
        },
      },
    });
  }
  async list(examId: number) {
    return this.prismaService.answer.findMany({
      where: { examId },
      include: {
        exam: true,
        answerer: true,
      },
    });
  }
  async find(id: number) {
    return this.prismaService.answer.findUnique({
      where: { id },
      include: {
        exam: true,
        answerer: true,
      },
    });
  }
}
