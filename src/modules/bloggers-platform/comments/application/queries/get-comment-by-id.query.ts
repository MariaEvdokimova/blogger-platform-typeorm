import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentViewDto } from "../../api/view-dto/comments.view-dto";
import { CommentsQueryRepository } from "../../infrastructure/query/comments.query-repository";

export class GetCommenByIdQuery {
  constructor(
    public commentId: number,
    public userId: number
  ) {}
}

@QueryHandler(GetCommenByIdQuery)
export class GetCommentByIdQueryHandler
  implements IQueryHandler<GetCommenByIdQuery, CommentViewDto>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute({ commentId, userId }: GetCommenByIdQuery) {
    return this.commentsQueryRepository.getFullInfoByIdOrNotFoundFail( commentId, userId );
  }
}
