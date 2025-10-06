import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(
    private readonly dataSource: DataSource
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot truncate tables in production');
    }

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

    for (const table of tables) {
      await this.dataSource.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
    }

    // const promises = tables.map((table) =>
    //   this.dataSource.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`)
    // );
    // await Promise.all(promises);

    return {
      status: 'succeeded',
    };
  }
}
