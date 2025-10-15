import { LikeStatus } from "../../domain/entities/comment-like.entity";

interface CommentInfoInputDto {
  id: number;
  content: string;
  userId: number;
  userLogin: string;
  likesCount?: number | null;
  dislikesCount?: number | null;
  myStatus?: LikeStatus | null;
  createdAt: Date
};

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string,
    userLogin: string,
  };
  likesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
  };
  createdAt: Date

  static mapToView(comment: CommentInfoInputDto): CommentViewDto {
    const dto = new CommentViewDto();
    dto.id = comment.id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.userId.toString(),
      userLogin: comment.userLogin
    };
    dto.createdAt = comment.createdAt;

    dto.likesInfo = {
      likesCount: Number(comment.likesCount ?? 0),
      dislikesCount: Number(comment.dislikesCount ?? 0),
      myStatus: comment.myStatus ?? LikeStatus.None, 
    };

    return dto;
  }
}
