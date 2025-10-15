import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../infrastructure/query/blogs.query-repository";

export class GetBlogByIdQuery {
  constructor(public id: number) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler
  implements IQueryHandler<GetBlogByIdQuery>
{
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute( {id}: GetBlogByIdQuery) {
    return this.blogsQueryRepository.getToViewByIdOrNotFoundFail( id );
  }
}
