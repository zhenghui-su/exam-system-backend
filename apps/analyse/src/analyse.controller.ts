import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AnalyseService } from './analyse.service';
import { RequireLogin } from '@app/common';

@Controller('analyse')
export class AnalyseController {
  constructor(private readonly analyseService: AnalyseService) {}

  @Get()
  getHello(): string {
    return this.analyseService.getHello();
  }

  @Get('ranking')
  @RequireLogin()
  async ranking(@Query('examId') examId: string) {
    if (!examId) {
      throw new BadRequestException('examId 不能为空');
    }
    return this.analyseService.ranking(+examId);
  }
}
