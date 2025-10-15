import { IsEnum } from "class-validator";
import { LikeStatus } from "../../domain/entities/likes.entity";

export class UpdatePostLikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
