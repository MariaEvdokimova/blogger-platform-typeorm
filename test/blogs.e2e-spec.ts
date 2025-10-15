import request from 'supertest';
import { HttpStatus, INestApplication } from "@nestjs/common";
import { UsersTestManager } from "./helpers/users-test-manager";
import { initSettings } from "./helpers/init-settings";
import { deleteAllData } from "./helpers/delete-all-data";
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { CreateBlogInputDto } from '@src/modules/bloggers-platform/blogs/api/input-dto/blogs.input-dto';
import { PaginatedViewDto } from '@src/core/dto/base.paginated.view-dto';
import { BlogViewDto } from '@src/modules/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import { PostsTestManager } from './helpers/posts-test-manager';
import { PostViewDto } from '@src/modules/bloggers-platform/posts/api/view-dto/posts.view-dto';

describe('blogs', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>{
      return moduleBuilder
    });
    app = result.app;
    userTestManger = result.userTestManger;
    blogsTestManager = result.blogsTestManager;
    postsTestManager = result.postsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });
  
  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should return all blogs with paging', async () => {
     await blogsTestManager.createSeveralBlogs( 12 );
     const { body: responseBody } = (await request(app.getHttpServer())
      .get(`/blogs`) 
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<BlogViewDto> };

    expect(responseBody.totalCount).toBe(12);
    expect(responseBody.items).toHaveLength(10);
    expect(responseBody.pagesCount).toBe(2);    
  });

  it('should return all posts with specified blog GET /blogs/{blogId}/posts', async () => {
    const blog = await blogsTestManager.createBlog();
    const posts = await postsTestManager.createSeveralPosts( 12, blog.id );
    
    const { body: responseBody } = (await request(app.getHttpServer())
      .get(`/blogs/${blog.id}/posts`) 
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<PostViewDto> };

    expect(responseBody.totalCount).toBe(12);
    expect(responseBody.items).toHaveLength(10);
    expect(responseBody.pagesCount).toBe(2);     
  });

  it('should return 404 if blog not found GET /blogs/{blogId}/posts', async () => {
    await request(app.getHttpServer())
      .get(`/blogs/999/posts`) 
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return blog by id', async () => {
    const blogDto: CreateBlogInputDto = {
      name: 'new blog 1',
      description: 'new description test',
      websiteUrl: 'https://eNf7vpWWtJWn2ME6etJ48A4D7.com'
    }

    const blog = await blogsTestManager.createBlog( blogDto );

    const { body: responseBody } = await request(app.getHttpServer())
      .get(`/blogs/${ blog.id }`)
      .expect(HttpStatus.OK);

    expect(responseBody).toEqual({
      id: expect.any(String),
      name: blogDto.name,
      description: blogDto.description,
      websiteUrl: blogDto.websiteUrl,
      isMembership: expect.any(Boolean),
      createdAt: expect.any(String),
    });
  });

  it('should return 404 if blog not found', async () => {
    await request(app.getHttpServer())
      .get(`/blogs/999`)
      .expect(HttpStatus.NOT_FOUND);
  });

});
