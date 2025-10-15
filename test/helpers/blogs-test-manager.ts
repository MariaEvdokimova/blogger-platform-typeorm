import { HttpStatus, INestApplication } from "@nestjs/common";
import request from 'supertest';
import { CreateBlogInputDto } from "../../src/modules/bloggers-platform/blogs/api/input-dto/blogs.input-dto";
import { BlogViewDto } from "../../src/modules/bloggers-platform/blogs/api/view-dto/blogs.view-dto";

export class BlogsTestManager {
  constructor(private app: INestApplication) {}

  async createBlog(
    createModel?: CreateBlogInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<BlogViewDto> {

    const defaultBlogData = {
      name: 'new blog 1',
      description: 'new description 1',
      websiteUrl: 'https://eNf7vpWWtJWn2ME6etJ48A4D7.com'
    }

    const testBlogData = { ...defaultBlogData, ...createModel };

    const response = await request(this.app.getHttpServer())
      .post(`/sa/blogs`)
      .send(testBlogData)
      .auth('admin', 'qwerty')
      .expect(statusCode);
    return response.body;
  }

  async createSeveralBlogs(count: number): Promise<BlogViewDto[]> {
    const blogs = [] as BlogViewDto[];

    for (let i = 0; i < count; ++i) {
      const response = await this.createBlog({
        name: `test` + i,
        description: 'description',
        websiteUrl: 'https://eNf7vpWWtJWn2ME6etJ48A4D7.com'
      });
      blogs.push(response);
    }

    return blogs;
  }
}
