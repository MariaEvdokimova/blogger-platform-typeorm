import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { UpdatePostDomainDto } from "../../dto/update-post.dto";

export class UpdatePostCommand {
  constructor(
    public id: number, 
    public dto: UpdatePostDomainDto
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand>
{
  constructor(
    private postsRepository: PostsRepository,
  ) {
    //console.log('UpdatePostUseCase');
  }

  async execute({ id, dto }: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail( id );
  
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    
    await this.postsRepository.save(post);
    return;
  }
}
