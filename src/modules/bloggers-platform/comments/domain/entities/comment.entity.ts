
import { BaseEntity } from "src/core/entities/base.entity";
import { Post } from "src/modules/bloggers-platform/posts/domain/entities/post.entity";
import { User } from "src/modules/user-accounts/domain/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { CommentLike } from "./comment-like.entity";

export const contentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Entity( { name: 'comments' })
export class Comment extends BaseEntity {
  @Column('varchar', { length: contentConstraints.maxLength, nullable: false })
  public content: string;
  
  @ManyToOne( () => Post, post => post.comments )
  post: Post;

  @Column()
  public postId: number;
  
  @OneToOne( () => User, user => user.comment )
  @JoinColumn()
  user: User;

  @Column()
  public userId: number;

  @OneToMany( () => CommentLike, commentLike => commentLike.comment )
  commentLikes: CommentLike[]
}