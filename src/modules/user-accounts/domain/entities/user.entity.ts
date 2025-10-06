import { BaseEntity } from 'src/core/entities/base.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { EmailConfirmation } from './email-confirmation.entity';
import { SecurityDevice } from './security-device.entity';
import { PostLike } from 'src/modules/bloggers-platform/posts/domain/entities/likes.entity';
import { Comment } from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';
import { CommentLike } from 'src/modules/bloggers-platform/comments/domain/entities/comment-like.entity';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]*$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  minLength: 5,
  maxLength: 500,
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

@Entity({ name: 'users'})
export class User extends BaseEntity {
  @Column('varchar', { length: loginConstraints.maxLength, unique: true, nullable: false })
  public login: string;
 
  @Column('varchar', { length: emailConstraints.maxLength, unique: true, nullable: false })
  public email: string;
 
  @Column('varchar', { nullable: false })
  public passwordHash: string;

  @OneToOne( () => EmailConfirmation, ( emailConfirmation ) => emailConfirmation.user )
  emailConfirmation: EmailConfirmation;

  @OneToMany( () => SecurityDevice, ( securityDevice ) => securityDevice.user )
  securityDevices: SecurityDevice[];

  @OneToOne( () => PostLike, postLike => postLike.user )
  postLike: PostLike;

  @OneToOne( () => Comment, comment => comment.user )
  comment: Comment;

  @OneToOne( () => CommentLike, commentLike => commentLike.user )
  commentLike: CommentLike;
}
