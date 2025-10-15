import { HttpStatus, INestApplication } from "@nestjs/common";
import request from 'supertest';
import { PostViewDto } from "../../src/modules/bloggers-platform/posts/api/view-dto/posts.view-dto";
import { CreatePostInputDto } from "@src/modules/bloggers-platform/posts/api/input-dto/posts.input-dto";

export class PostsTestManager {
  constructor(private app: INestApplication) {}

  async createPost(
    createModel: CreatePostInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewDto> {

    const response = await request(this.app.getHttpServer())
        .post(`/sa/blogs/${createModel.blogId}/posts`)
        .send({
          content: createModel.content,
          shortDescription: createModel.shortDescription,
          title: createModel.title
        })
        .auth('admin', 'qwerty')
        .expect(statusCode);
    
    return response.body;
  }

  async createSeveralPosts(count: number, blogId: string): Promise<PostViewDto[]> {
    const posts = [] as PostViewDto[];

    for (let i = 0; i < count; ++i) {
      const response = await this.createPost({
        content: 'content',
        shortDescription: 'shortDescription',
        title: `test` + i,
        blogId
      });
      posts.push(response);
    }

    return posts;
  }

}
