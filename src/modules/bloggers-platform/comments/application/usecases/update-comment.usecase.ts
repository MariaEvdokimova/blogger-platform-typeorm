import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { UserContextDto } from "../../dto/user-context.dto";
import { UpdateCommentInputDto } from "../../api/input-dto/comment-update.input-dto";

export class UpdateCommentCommand {
  constructor(
    public commentId: number,
    public dto: UpdateCommentInputDto,
    public user: UserContextDto
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(private commentsRepository: CommentsRepository) {
    //console.log('UpdateCommentUseCase created');
  }

  async execute({ commentId, dto, user }: UpdateCommentCommand): Promise<void> {
    await this.commentsRepository.findOrNotFoundFail( commentId );
    
    const commentVerifyed = await this.commentsRepository.verifyUserOwnership( commentId, Number(user.id));
    if ( !commentVerifyed ) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    commentVerifyed.content =  dto.content;
    await this.commentsRepository.save( commentVerifyed );
    
    return;
  }
}
