import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import {
  type Profile,
  Strategy,
  type VerifyCallback,
} from 'passport-google-oauth20'
import type { Env } from 'src/env'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService<Env, true>) {
    const clientID = config.get('GOOGLE_CLIENT_ID', { infer: true })
    const clientSecret = config.get('GOOGLE_CLIENT_SECRET', { infer: true })
    const callbackURL = config.get('GOOGLE_CALLBACK_URL', { infer: true })

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
    })
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, emails, displayName } = profile
    const email = emails?.[0]?.value

    done(null, { googleId: id, name: displayName, email })
  }
}
