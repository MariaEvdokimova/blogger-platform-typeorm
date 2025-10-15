import { IQueryHandler, QueryBus, QueryHandler } from "@nestjs/cqrs";
import { PostsQueryRepository } from "../../infrastructure/query/posts.query-repository";
import { GetCommentsQueryParams } from "../../../../bloggers-platform/comments/api/input-dto/get-comments-query-params.input-dto";
import { PaginatedViewDto } from "../../../../../core/dto/base.paginated.view-dto";
import { CommentViewDto } from "../../../../bloggers-platform/comments/api/view-dto/comments.view-dto";
import { GetCommentsByPostIdQuery } from "../../../../bloggers-platform/comments/application/queries/get-comments-by-post-id.query";

export class GetCommentsPostByIdQuery {
  constructor(
    public postId: number, 
    public query: GetCommentsQueryParams,
    public userId: number
  ) {}
}

@QueryHandler(GetCommentsPostByIdQuery)
export class GetCommentsPostByIdQueryHandler
  implements IQueryHandler<GetCommentsPostByIdQuery, PaginatedViewDto<CommentViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ postId, query, userId }: GetCommentsPostByIdQuery) {
    await this.postsQueryRepository.getByIdOrNotFoundFail( postId );
    return this.queryBus.execute( new GetCommentsByPostIdQuery( postId, query, userId ));
  }
}
