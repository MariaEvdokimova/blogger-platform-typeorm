import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBasicAuth, ApiParam } from "@nestjs/swagger";
import { BlogsQueryRepository } from "../infrastructure/query/blogs.query-repository";
import { PostsQueryRepository } from "../../posts/infrastructure/query/posts.query-repository";
import { CreateBlogInputDto } from "./input-dto/blogs.input-dto";
import { BlogViewDto } from "./view-dto/blogs.view-dto";
import { CreatePostInBlogInputDto } from "./input-dto/post-in-blog.input-dto";
import { PostViewDto } from "../../posts/api/view-dto/posts.view-dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { GetBlogsQueryParams } from "./input-dto/get-blogs-query-params.input-dto";
import { GetPostsQueryParams } from "../../posts/api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetBlogsQuery } from "../application/queries/get-blogs.query";
import { GetPostsInBlogQuery } from "../application/queries/get-posts-in-blog.query";
import { DeleteBlogCommand } from "../application/usecases/delete-blog.usecase";
import { CreateBlogCommand } from "../application/usecases/create-blog.usecase";
import { BasicAuthGuard } from "../../../user-accounts/guards/basic/basic-auth.guard";
import { UpdateBlogCommand } from "../application/usecases/update-blog.usecase";
import { SkipThrottle } from "@nestjs/throttler";
import { CreatePostCommand } from "../../posts/application/usecases/create-post.usecase";
import { UpdatePostInBlogDomainDto } from "../dto/update-post-in-blog.dto";
import { UpdatePostCommand } from "../../posts/application/usecases/update-post.usecase";
import { DeletePostCommand } from "../../posts/application/usecases/delete-post.usecase";

@SkipThrottle()
@ApiBasicAuth('basicAuth')
@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsSuperAdminController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,  
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
 
  @Get()
  async getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQuery( query ));
  }
  
  @ApiParam({ name: 'blogId' }) //для сваггера
  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId', ParseIntPipe) blogId: number, 
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute( new GetPostsInBlogQuery( blogId, query ));
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute( new CreateBlogCommand( body ));
    return this.blogsQueryRepository.getToViewByIdOrNotFoundFail(blogId);
  }

  @ApiParam({ name: 'blogId' }) //для сваггера
  @Post(':blogId/posts')
  async createPostInBlog(
    @Param('blogId', ParseIntPipe) blogId: number, 
    @Body() body: CreatePostInBlogInputDto
  ): Promise<PostViewDto> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail( blogId );
    const postId = await this.commandBus.execute( new CreatePostCommand( body, blogId ));
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId); 
  }
  
  @ApiParam({ name: 'id' }) //для сваггера
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ParseIntPipe) id: number, 
    @Body() body: UpdateBlogDto
  ): Promise<void> {
    return this.commandBus.execute( new UpdateBlogCommand( id, body ));
  }

  @ApiParam({name: 'blogId', type: String})
  @ApiParam({name: 'postId', type: String})
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostInBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: UpdatePostInBlogDomainDto
  ): Promise<void> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail( blogId );
    return this.commandBus.execute( new UpdatePostCommand( postId, {...body, blogId: blogId }));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute( new DeleteBlogCommand( id ));
  }

  @ApiParam({name: 'blogId', type: String})
  @ApiParam({name: 'postId', type: String})
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostInBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Param('postId', ParseIntPipe) postId: number
  ): Promise<void> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail( blogId );
    return this.commandBus.execute( new DeletePostCommand( postId ));
  }
}
