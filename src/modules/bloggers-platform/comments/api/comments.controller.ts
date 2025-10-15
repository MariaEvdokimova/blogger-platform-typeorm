import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { CommentViewDto } from "./view-dto/comments.view-dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetCommenByIdQuery } from "../application/queries/get-comment-by-id.query";
import { JwtAuthGuard } from "../../../user-accounts/guards/bearer/jwt-auth.guard";
import { DeleteCommentCommand } from "../application/usecases/delete-comment.usecase";
import { ExtractUserFromRequest } from "../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator";
import { UserContextDto } from "../dto/user-context.dto";
import { UpdateCommentInputDto } from "./input-dto/comment-update.input-dto";
import { UpdateCommentCommand } from "../application/usecases/update-comment.usecase";
import { UpdateCommentLikeStatusInputDto } from "./input-dto/comment-like-status-update.input-dto";
import { UpdateCommentLikeStatusCommand } from "../application/usecases/update-comment-like-status.usecase";
import { OptionalJwtGuard } from "../../../user-accounts/guards/bearer/jwt-optional.quard";
import { UserId } from "../../../user-accounts/guards/decorators/param/user-id.decorator";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller('comments')
export class CommentsController {
  constructor( 
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
 
  @UseGuards(OptionalJwtGuard)
  @ApiParam({ name: 'id' }) 
  @Get(':id')
  async getAll(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number
  ): Promise<CommentViewDto> {
    return this.queryBus.execute( new GetCommenByIdQuery( id, userId ));
  }

  @ApiBearerAuth('JwtAuth')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'commentId' }) //для сваггера
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number, 
    @Body() body: UpdateCommentInputDto, 
    @ExtractUserFromRequest() user: UserContextDto
  ): Promise<void> {
    return this.commandBus.execute( new UpdateCommentCommand( commentId, body, user ));
  }
  
  @ApiBearerAuth('JwtAuth')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'commentId' }) //для сваггера
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLike(
    @Param('commentId', ParseIntPipe) commentId: number, 
    @Body() body: UpdateCommentLikeStatusInputDto, 
    @ExtractUserFromRequest() user: UserContextDto
  ): Promise<void> {
    return this.commandBus.execute( new UpdateCommentLikeStatusCommand( commentId, body, user ));
  }

  @ApiBearerAuth('JwtAuth')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'commentId' }) //для сваггера
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId', ParseIntPipe) id: number, 
    @ExtractUserFromRequest() user: UserContextDto
  ): Promise<void> {
    return this.commandBus.execute( new DeleteCommentCommand( id, user ));
  }
}
