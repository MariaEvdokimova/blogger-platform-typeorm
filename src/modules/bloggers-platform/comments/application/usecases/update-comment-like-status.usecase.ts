import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateCommentLikeStatusInputDto } from "../../api/input-dto/comment-like-status-update.input-dto";
import { UserContextDto } from "../../dto/user-context.dto";
import { CommentLikesRepository } from "../../infrastructure/comment-likes.repository";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { CommentLike } from "../../domain/entities/comment-like.entity";

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: number,
    public dto: UpdateCommentLikeStatusInputDto,
    public user: UserContextDto
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand, void>
{
  constructor(
    private commentLikesRepository: CommentLikesRepository,
    private commentsRepository: CommentsRepository,
  ) {
    //console.log('UpdateCommentLikeUseCase created');
  }

  async execute({ commentId, dto, user }: UpdateCommentLikeStatusCommand): Promise<void> {
    const { likeStatus } = dto;
    await this.commentsRepository.findOrNotFoundFail( commentId );
   
    let commentLike = await this.commentLikesRepository.findUserCommentStatus( commentId, Number(user.id) );
    if ( commentLike && commentLike.status === likeStatus) return;

    if ( !commentLike ) {
      commentLike = CommentLike.create({ 
        commentId: commentId, 
        userId: Number(user.id), 
        status: likeStatus
      });
    } else {
      commentLike.status = likeStatus;
    }

    await this.commentLikesRepository.save( commentLike );
    return;
  }
}
