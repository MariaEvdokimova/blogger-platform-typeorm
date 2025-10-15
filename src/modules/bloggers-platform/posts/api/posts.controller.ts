import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { PostsQueryRepository } from "../infrastructure/query/posts.query-repository";
import { ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { PostViewDto } from "./view-dto/posts.view-dto";
import { GetPostsQueryParams } from "./input-dto/get-posts-query-params.input-dto";
import { CommentViewDto } from "../../comments/api/view-dto/comments.view-dto";
import { GetCommentsQueryParams } from "../../comments/api/input-dto/get-comments-query-params.input-dto";
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetPostsQuery } from "../application/queries/get-posts.query";
import { GetPostByIdQuery } from "../application/queries/get-post-by-id.query";
import { GetCommentsPostByIdQuery } from "../application/queries/get-comments-by-post-id.query";
import { JwtAuthGuard } from "../../../user-accounts/guards/bearer/jwt-auth.guard";
import { CommentInputDto } from "../../comments/api/input-dto/comment.input-dto";
import { ExtractUserFromRequest } from "../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator";
import { UserContextDto } from "../../../user-accounts/dto/user-context.dto";
import { CreateCommentByPostIdCommand } from "../application/usecases/create-comment-by-post-id.usecase";
import { GetCommenByIdQuery } from "../../comments/application/queries/get-comment-by-id.query";
import { UpdatePostLikeStatusInputDto } from "./input-dto/post-like-status-update.input-dto";
import { UpdatePostLikeStatusCommand } from "../application/usecases/update-post-like-status.usecase";
import { UserId } from "../../../user-accounts/guards/decorators/param/user-id.decorator";
import { OptionalJwtGuard } from "../../../user-accounts/guards/bearer/jwt-optional.quard";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
 
  @UseGuards(OptionalJwtGuard)
  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
    @UserId() userId: number
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute( new GetPostsQuery( query, userId ));
  }
 
  @UseGuards(OptionalJwtGuard)
  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getPost(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number
  ): Promise<PostViewDto> {
    return this.queryBus.execute( new GetPostByIdQuery( id, userId ));
  }

  @UseGuards(OptionalJwtGuard)
  @ApiParam({ name: 'postId' }) //для сваггера
  @Get(':postId/comments')
  async getPostComments(
    @Param('postId', ParseIntPipe) postId: number, 
    @Query() query: GetCommentsQueryParams,
    @UserId() userId: number
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute( new GetCommentsPostByIdQuery( postId, query, userId ));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuth')
  @ApiParam({ name: 'postId' }) //для сваггера
  @Post(':postId/comments')
  async createPostComment(
    @Param('postId', ParseIntPipe) postId: number, 
    @Body() body: CommentInputDto, 
    @ExtractUserFromRequest() user: UserContextDto
  ): Promise<CommentViewDto> {
    await this.postsQueryRepository.getByIdOrNotFoundFail( postId );
    const commentId = await this.commandBus.execute(new CreateCommentByPostIdCommand( body, postId, Number(user.id))); 
    return this.queryBus.execute( new GetCommenByIdQuery( commentId, Number(user.id) ));
  }
  
  @ApiBearerAuth('JwtAuth')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'postId' }) 
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('postId', ParseIntPipe) postId: number, 
    @Body() body: UpdatePostLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto
  ): Promise<void> {
    return this.commandBus.execute( new UpdatePostLikeStatusCommand( postId, body, Number(user.id) ));
  }
}
