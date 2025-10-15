import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBlogsQueryParams } from "../../api/input-dto/get-blogs-query-params.input-dto";
import { BlogsQueryRepository } from "../../infrastructure/query/blogs.query-repository";

export class GetBlogsQuery {
  constructor(public dto: GetBlogsQueryParams) {}
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler
  implements IQueryHandler<GetBlogsQuery>
{
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute({ dto }: GetBlogsQuery) {
    return this.blogsQueryRepository.getAll( dto );
  }
}
