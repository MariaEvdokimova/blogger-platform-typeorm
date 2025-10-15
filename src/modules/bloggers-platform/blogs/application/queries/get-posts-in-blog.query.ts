import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../infrastructure/query/blogs.query-repository";
import { PostsQueryRepository } from "../../../../bloggers-platform/posts/infrastructure/query/posts.query-repository";
import { GetPostsQueryParams } from "../../../../bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { PostViewDto } from "../../../../bloggers-platform/posts/api/view-dto/posts.view-dto";

export class GetPostsInBlogQuery {
  constructor(
    public blogId: number,
    public query: GetPostsQueryParams,
    public userId?: number
  ) {}
}

@QueryHandler(GetPostsInBlogQuery)
export class GetPostsInBlogQueryHandler
  implements IQueryHandler<GetPostsInBlogQuery, PaginatedViewDto<PostViewDto[]> >
{
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute( { blogId, query, userId }: GetPostsInBlogQuery) {
    await this.blogsQueryRepository.getByIdOrNotFoundFail( blogId );
    return this.postsQueryRepository.getPostsInBlog( query, blogId, userId );
  }
}
