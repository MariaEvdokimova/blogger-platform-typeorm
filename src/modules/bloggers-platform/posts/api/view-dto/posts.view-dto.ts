import { ExtendedLikesInfo, NewestLikes } from "../../domain/dto/extended-likes-info.dto";
import { LikeStatus } from "../../domain/entities/likes.entity";


interface PostInfoInputDto {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  blogName: string;
  likesCount?: number | null;
  dislikesCount?: number | null;
  myStatus?: LikeStatus | null;
  createdAt: Date,
  newestLikes?: NewestLikes[];
};

export class PostViewDto {
  id:	string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo

  static mapToView( post: PostInfoInputDto ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id!.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    dto.extendedLikesInfo = {
      likesCount: Number(post.likesCount ?? 0),
      dislikesCount: Number(post.dislikesCount ?? 0),
      myStatus: post.myStatus ?? LikeStatus.None, 
      newestLikes: (post.newestLikes ?? []).map(like => ({
        userId: like.userId.toString(),
        login: like.login,
        addedAt: new Date(like.addedAt),
      })),
    };

    return dto;
  }
}
