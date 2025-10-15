import { LikeStatus } from "../entities/likes.entity";


export class CreatePostLikeStatusDomainDto {
  postId:	number;
  userId: number;
  status:	LikeStatus;
}
