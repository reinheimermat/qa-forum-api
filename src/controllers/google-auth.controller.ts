import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { GoogleOauthGuard } from '@/auth/guards/google-oauth.guard'
import { PrismaService } from '@/prisma/prisma.service'

type GoogleUserPayload = {
  googleId: string
  name?: string | null
  email?: string | null
}

@Controller()
export class GoogleAuthController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Get('auth/google/login')
  @UseGuards(GoogleOauthGuard)
  async googleLogin() {}

  @Get('auth/google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleCallback(@Req() req: { user: GoogleUserPayload }) {
    const { googleId, email, name } = req.user

    if (!googleId) {
      throw new UnauthorizedException('Missing Google ID')
    }

    let user = await this.prisma.user.findUnique({ where: { googleId } })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId,
          email: email || '',
          name: name || 'User',
          password: '',
        },
      })
    }

    const accessToken = this.jwt.sign({ sub: user.id })

    return { accessToken }
  }
}
