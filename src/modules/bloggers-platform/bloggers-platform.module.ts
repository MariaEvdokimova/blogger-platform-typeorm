import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blogs/domain/entities/blog.entity';
import { Post } from './posts/domain/entities/post.entity';
import { PostLike } from './posts/domain/entities/likes.entity';
import { Comment } from './comments/domain/entities/comment.entity';
import { CommentLike } from './comments/domain/entities/comment-like.entity';

const commandHandlers = [
  // CreateBlogUseCase,
  // DeleteBlogUseCase,
  // UpdateBlogUseCase,
  // DeleteCommentUseCase,
  // UpdateCommentUseCase,
  // UpdateCommentLikeStatusUseCase,
  // DeletePostUseCase,
  // CreatePostUseCase,
  // UpdatePostUseCase,
  // CreateCommentByPostIdUseCase,
  // UpdatePostLikeStatusUseCase,
];

const queryHandlers = [
  // GetBlogsQueryHandler,
  // GetBlogByIdQueryHandler,
  // GetPostsInBlogQueryHandler,
  // GetCommentByIdQueryHandler,
  // GetCommentsByPostIdQueryHandler,
  // GetCommentsPostByIdQueryHandler,
  // GetPostsQueryHandler,
  // GetPostByIdQueryHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([ Blog, Post, PostLike, Comment, CommentLike ]),
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    // CommentsController, 
    // PostsController,
    // BlogsController,
    // BlogsSuperAdminController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    // CommentsQueryRepository,
    // CommentsRepository,
    // CommentLikesRepository,
    // PostsQueryRepository,
    // PostsRepository,
    // PostLikesRepository,
    // PostsLikesQueryRepository,
    // BlogsQueryRepository,
    // BlogsRepository,
    // BlogsFactory,
    // CommentFactory,
    // PostsFactory,
    // PostLikeStatusFactory,
    // CommentLikeStatusFactory,
    // UsersRepository,
  ],
})
export class BloggersPlatformModule {}
