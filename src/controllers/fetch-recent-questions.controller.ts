import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import z from 'zod'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe'
import { PrismaService } from '@/prisma/prisma.service'

const pageQueryParamsSchema = z.coerce
  .number()
  .int()
  .min(1)
  .optional()
  .default(1)

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema)

type PageQueryParams = z.infer<typeof pageQueryParamsSchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@Query('page', queryValidationPipe) page: PageQueryParams) {
    const perPage = 20

    const questions = await this.prisma.question.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      questions,
    }
  }
}
