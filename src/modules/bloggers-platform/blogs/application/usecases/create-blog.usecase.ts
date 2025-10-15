import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBlogInputDto } from "../../api/input-dto/blogs.input-dto";
import { BlogsRepository } from "../../infrastructure/blogs.repository";
import { Blog } from "../../domain/entities/blog.entity";

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, number>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<number> {
    const blog = Blog.create( dto );
    const blogCreated = await this.blogsRepository.save( blog );

    return blogCreated.id;
  }
}
