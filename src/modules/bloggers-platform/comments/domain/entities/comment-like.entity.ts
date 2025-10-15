import { BaseEntity } from "@src/core/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Comment } from "./comment.entity";
import { User } from "@src/modules/user-accounts/domain/entities/user.entity";
import { CreateCommentLikeStatusDomainDto } from "../dto/create-comment-like-status.domain.dto";

export enum LikeStatus {
  None = 'None', 
  Like = 'Like', 
  Dislike = 'Dislike',
 };

@Entity({ name: 'commentLikes' })
export class CommentLike extends BaseEntity {
  @Column( 'enum', { enum: LikeStatus, default: LikeStatus.None })
  public status: LikeStatus;
  
  @ManyToOne( () => Comment, comment => comment.commentLikes )
  comment: Comment

  @Column()
  public commentId: number;
  
  @OneToOne( () => User, user => user.commentLike )
  @JoinColumn()
  user: User;

  @Column()
  public userId: number;

  static create(dto: CreateCommentLikeStatusDomainDto): CommentLike {
    const comment = new this();
      comment.commentId = dto.commentId;
      comment.userId = dto.userId;
      comment.status = dto.status;
    return comment;
  }
}