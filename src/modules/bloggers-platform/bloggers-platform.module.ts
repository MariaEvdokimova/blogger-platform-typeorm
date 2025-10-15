import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blogs/domain/entities/blog.entity';
import { Post } from './posts/domain/entities/post.entity';
import { PostLike } from './posts/domain/entities/likes.entity';
import { Comment } from './comments/domain/entities/comment.entity';
import { CommentLike } from './comments/domain/entities/comment-like.entity';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './comments/application/usecases/update-comment-like-status.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { CreateCommentByPostIdUseCase } from './posts/application/usecases/create-comment-by-post-id.usecase';
import { UpdatePostLikeStatusUseCase } from './posts/application/usecases/update-post-like-status.usecase';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query';
import { GetCommentsByPostIdQueryHandler } from './comments/application/queries/get-comments-by-post-id.query';
import { GetCommentsPostByIdQueryHandler } from './posts/application/queries/get-comments-by-post-id.query';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query';
import { GetPostsInBlogQueryHandler } from './blogs/application/queries/get-posts-in-blog.query';
import { CommentsController } from './comments/api/comments.controller';
import { PostsController } from './posts/api/posts.controller';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsSuperAdminController } from './blogs/api/blogs-super-admin.controller';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostLikesRepository } from './posts/infrastructure/posts-likes.repository';
import { CommentLikesRepository } from './comments/infrastructure/comment-likes.repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { UsersRepository } from '../user-accounts/infrastructure/users.repository';
import { User } from '../user-accounts/domain/entities/user.entity';

const commandHandlers = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  DeletePostUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  CreateCommentByPostIdUseCase,
  UpdatePostLikeStatusUseCase,
];

const queryHandlers = [
  GetBlogsQueryHandler,
  GetBlogByIdQueryHandler,
  GetPostsInBlogQueryHandler,
  GetCommentByIdQueryHandler,
  GetCommentsByPostIdQueryHandler,
  GetCommentsPostByIdQueryHandler,
  GetPostsQueryHandler,
  GetPostByIdQueryHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([ Blog, Post, PostLike, Comment, CommentLike, User ]),
    CqrsModule,
    UserAccountsModule,
  ],
  controllers: [
    CommentsController, 
    PostsController,
    BlogsController,
    BlogsSuperAdminController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    CommentsQueryRepository,
    CommentsRepository,
    CommentLikesRepository,
    PostsQueryRepository,
    PostsRepository,
    PostLikesRepository,
    BlogsQueryRepository,
    BlogsRepository,
    UsersRepository,
  ],
})
export class BloggersPlatformModule {}
