import { Response } from 'express';
import { cookieConfig } from 'src/core/config/cookie.config';

export class CookieService {
  static setRefreshTokenCookie(response: Response, refreshToken: string): void {
    response.cookie(cookieConfig.refreshToken.name, refreshToken, {
      httpOnly: cookieConfig.refreshToken.httpOnly,
      secure: cookieConfig.refreshToken.secure,
      maxAge: cookieConfig.refreshToken.maxAge,
      path: '/',
    });
  }

  static clearRefreshTokenCookie(response: Response): void {
    response.clearCookie(cookieConfig.refreshToken.name, {
      httpOnly: cookieConfig.refreshToken.httpOnly,
      secure: cookieConfig.refreshToken.secure,
      path: '/',
    });
  }
}
