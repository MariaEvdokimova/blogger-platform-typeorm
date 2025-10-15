import request from 'supertest';
import { HttpStatus, INestApplication } from "@nestjs/common";
import { UsersTestManager } from "./helpers/users-test-manager";
import { initSettings } from "./helpers/init-settings";
import { JwtService } from "@nestjs/jwt";
import { deleteAllData } from "./helpers/delete-all-data";
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { PostsTestManager } from './helpers/posts-test-manager';
import { LikeStatus } from '@src/modules/bloggers-platform/posts/domain/entities/likes.entity';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { ConfigService } from '@nestjs/config';
import { CreatePostInputDto } from '@src/modules/bloggers-platform/posts/api/input-dto/posts.input-dto';
import { create } from 'domain';
import e from 'express';

describe('posts', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>{
      return moduleBuilder
              .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
              .useFactory({
                factory: (configService: ConfigService) => {
                  return new JwtService({
                    secret: configService.get('ACCESS_TOKEN_SECRET'),
                    signOptions: {
                      expiresIn: configService.get('ACCESS_TOKEN_EXPIRE_IN'),
                    },
                  });
                },
                inject: [ConfigService],
              })
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

  it('should create post', async () => {
    const blog = await blogsTestManager.createBlog();

    const body: CreatePostInputDto = {
      content:"new post content",
      shortDescription:"new description",
      title:"post title",
      blogId: blog.id
    }

    const post = await postsTestManager.createPost( body);

    expect(post).toEqual({
      title: body.title,
      content: body.content,
      shortDescription: body.shortDescription,
      id: expect.any(String),
      blogName: blog.name,
      blogId: blog.id,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
        newestLikes: expect.any(Array),
      }
   });
  });
/*
  it('should create post', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost( blog.id);
    const tokens = await userTestManger.createAndLoginSeveralUsers(4);

    await request(app.getHttpServer())
      .put(`/posts/${ post.id }/like-status`)
      .auth(tokens[0].accessToken, { type: 'bearer' })
      .send({likeStatus: LikeStatus.Like})
      .expect(HttpStatus.NO_CONTENT);
      
      const postWithLike1 = await request(app.getHttpServer())
      .get(`/posts/${ post.id }`)
      .auth(tokens[0].accessToken, { type: 'bearer' })
      .send()
      .expect(HttpStatus.OK);

      expect(postWithLike1.body.extendedLikesInfo.myStatus).toEqual('Like');
      expect(postWithLike1.body.extendedLikesInfo.newestLikes.length).toEqual(1);
      //console.log('postWithLike1 ', postWithLike1.body.extendedLikesInfo);

      //=========user2=====================      
         
      await request(app.getHttpServer())
        .put(`/posts/${ post.id }/like-status`)
        .auth(tokens[1].accessToken, { type: 'bearer' })
        .send({likeStatus: LikeStatus.Like})
        .expect(HttpStatus.NO_CONTENT);
      
      const postWithLike2 = await request(app.getHttpServer())
        .get(`/posts/${ post.id }`)
      .auth(tokens[1].accessToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);

        
      expect(postWithLike2.body.extendedLikesInfo.myStatus).toEqual('Like');
      expect(postWithLike2.body.extendedLikesInfo.newestLikes.length).toEqual(2);
      //console.log('postWithLike2 ', postWithLike2.body.extendedLikesInfo);

      // =====================user3 
      await request(app.getHttpServer())
        .put(`/posts/${ post.id }/like-status`)
        .auth(tokens[2].accessToken, { type: 'bearer' })
        .send({likeStatus: LikeStatus.Dislike})
        .expect(HttpStatus.NO_CONTENT);
      
      const postWithLike3 = await request(app.getHttpServer())
        .get(`/posts/${ post.id }`)
      .auth(tokens[2].accessToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);

      
      expect(postWithLike3.body.extendedLikesInfo.myStatus).toEqual('Dislike');
      expect(postWithLike3.body.extendedLikesInfo.newestLikes.length).toEqual(2);
      //console.log('postWithLike3 ', postWithLike3.body.extendedLikesInfo);
  });
*/
  it('should return users info while "me" request with correct accessTokens', async () => {
    
  });

});
