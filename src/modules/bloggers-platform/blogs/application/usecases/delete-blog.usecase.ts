import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../infrastructure/blogs.repository";

export class DeleteBlogCommand {
  constructor(public blogId: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements ICommandHandler<DeleteBlogCommand, void>
{
  constructor(private blogsRepository: BlogsRepository) {
    //console.log('DeleteBlogUseCase');
  }

  async execute({ blogId }: DeleteBlogCommand): Promise<void> {
    await this.blogsRepository.findOrNotFoundFail( blogId );
    await this.blogsRepository.softDelete( blogId );
    return;
  }
}
