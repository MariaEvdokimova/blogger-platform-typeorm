import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query-repository";

export class GetPostByIdQuery {
  constructor(
    public id: number,
    public userId: number
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler
  implements IQueryHandler<GetPostByIdQuery, PostViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute({ id, userId }: GetPostByIdQuery) {
    return this.postsQueryRepository.getFullInfoByIdOrNotFoundFail( id, userId );
  }
}
