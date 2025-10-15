import { IsEnum } from "class-validator";
import { LikeStatus } from "../../domain/entities/comment-like.entity";

export class UpdateCommentLikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
