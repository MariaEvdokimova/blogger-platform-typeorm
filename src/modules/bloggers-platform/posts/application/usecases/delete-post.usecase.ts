import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";

export class DeletePostCommand {
  constructor(
    public postId: number
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(private postsRepository: PostsRepository) {
    //console.log('DeletePostUseCase');
  }

  async execute({ postId }: DeletePostCommand): Promise<void> {
    await this.postsRepository.findOrNotFoundFail( postId );
    await this.postsRepository.softDelete(postId);
    return;
  }
}
