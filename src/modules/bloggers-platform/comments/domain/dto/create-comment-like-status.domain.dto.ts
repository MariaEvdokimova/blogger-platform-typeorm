import { LikeStatus } from "../entities/comment-like.entity";

export class CreateCommentLikeStatusDomainDto {
  commentId:	number;
  userId: number;
  status:	LikeStatus;
}
