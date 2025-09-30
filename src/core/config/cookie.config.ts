enum CookieMaxAge {
  ONE_DAY = 24 * 60 * 60 * 1000,  // 1 день в миллисекундах
  SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000,  // 7 дней в миллисекундах
  THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000,  // 30 дней в миллисекундах
}

export const cookieConfig = {
  refreshToken: {
    name: 'refreshToken',
    httpOnly: true, 
    secure: true,
    maxAge: CookieMaxAge.SEVEN_DAYS,
  }
}
