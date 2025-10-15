import { BaseEntity } from "@src/core/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Post } from "./post.entity";
import { User } from "@src/modules/user-accounts/domain/entities/user.entity";
import { CreatePostLikeStatusDomainDto } from "../dto/create-post-like-status.domain.dto";

export enum LikeStatus {
  None = 'None', 
  Like = 'Like', 
  Dislike = 'Dislike',
 };

@Entity({ name: 'postLikes' })
export class PostLike extends BaseEntity {
  @Column('enum', { enum: LikeStatus, default: LikeStatus.None })
  public status: LikeStatus;

  @ManyToOne( () => Post, post => post.postLike )
  post: Post;

  @Column()
  public postId: number;
  
  @OneToOne( () => User, user => user.postLike )
  @JoinColumn()
  user: User

  @Column()
  public userId: number;  

  static create(dto: CreatePostLikeStatusDomainDto): PostLike {
    const postLike = new this();
      postLike.postId = dto.postId;
      postLike.userId = dto.userId;
      postLike.status = dto.status;

    return postLike;
  }
}