import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";
import { BlogViewDto } from "./view-dto/blogs.view-dto";
import { PostViewDto } from "../../posts/api/view-dto/posts.view-dto";
import { GetBlogsQueryParams } from "./input-dto/get-blogs-query-params.input-dto";
import { GetPostsQueryParams } from "../../posts/api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { QueryBus } from "@nestjs/cqrs";
import { GetBlogsQuery } from "../application/queries/get-blogs.query";
import { GetBlogByIdQuery } from "../application/queries/get-blog-by-id.query";
import { GetPostsInBlogQuery } from "../application/queries/get-posts-in-blog.query";
import { OptionalJwtGuard } from "@src/modules/user-accounts/guards/bearer/jwt-optional.quard";
import { UserId } from "@src/modules/user-accounts/guards/decorators/param/user-id.decorator";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}
 
  @Get()
  async getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQuery( query ));
  }
 
  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getBlog(@Param('id', ParseIntPipe) id: number): Promise<BlogViewDto> {
    return this.queryBus.execute( new GetBlogByIdQuery( id ));
  }
  
  @UseGuards(OptionalJwtGuard)
  @ApiParam({ name: 'blogId' }) //для сваггера
  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId', ParseIntPipe) blogId: number, 
    @Query() query: GetPostsQueryParams,
    @UserId() userId: number
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute( new GetPostsInBlogQuery( blogId, query, userId ));
  }
}
