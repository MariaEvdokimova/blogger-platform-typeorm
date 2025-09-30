import { Controller, Delete, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Pool } from 'pg';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(
    @Inject('PG_POOL') private readonly db: Pool,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const tables = [
      'users', 
      'emailConfirmation', 
      'securityDevice', 
      'blogs', 
      'posts', 
      'comments', 
      'commentLikes',
      'postLikes'
    ]; 
    const promises = tables.map((table) =>
      this.db.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`)
    );
    await Promise.all(promises);

    return {
      status: 'succeeded',
    };
  }
}
