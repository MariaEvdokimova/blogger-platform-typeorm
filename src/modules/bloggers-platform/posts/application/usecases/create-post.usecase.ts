import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { CreatePostInBlogInputDto } from "@src/modules/bloggers-platform/blogs/api/input-dto/post-in-blog.input-dto";
import { Post } from "../../domain/entities/post.entity";

export class CreatePostCommand {
  constructor(
    public dto: CreatePostInBlogInputDto,
    public blogId: number
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, number>
{
  constructor(
    private postsRepository: PostsRepository,
  ) {
    //console.log('CreatePostUseCase');
  }

  async execute({ dto, blogId }: CreatePostCommand): Promise<number> {
    const post = Post.create( dto, blogId );
    const postCreated = await this.postsRepository.save( post );

    return postCreated.id;
  }
}
