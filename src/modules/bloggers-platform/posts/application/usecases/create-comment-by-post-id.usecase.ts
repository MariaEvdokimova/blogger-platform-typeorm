import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentInputDto } from "./../../../../bloggers-platform/comments/api/input-dto/comment.input-dto";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";
import { DomainException } from "../../../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../../../core/exceptions/domain-exception-codes";
import { CommentsRepository } from "./../../../../bloggers-platform/comments/infrastructure/comments.repository";
import { Comment } from "@src/modules/bloggers-platform/comments/domain/entities/comment.entity";

export class CreateCommentByPostIdCommand {
  constructor(
    public dto: CommentInputDto,
    public postId: number,
    public userId: number
  ) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase
  implements ICommandHandler<CreateCommentByPostIdCommand, number>
{
  constructor(
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
  ) {
   // console.log('CreateCommentByPostIdUseCase');
  }

  async execute({ dto, postId, userId }: CreateCommentByPostIdCommand): Promise<number> {
    const user = await this.usersRepository.findById( userId );
    if ( !user ) {
        throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound'
      });
    }

    const newComment = Comment.create( dto, postId, user.id! );
    const comment = await this.commentsRepository.save( newComment );
    return comment.id;
  }
}
