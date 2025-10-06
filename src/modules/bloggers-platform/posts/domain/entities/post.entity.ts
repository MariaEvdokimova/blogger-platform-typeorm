import { BaseEntity } from "src/core/entities/base.entity";
import { Blog } from "src/modules/bloggers-platform/blogs/domain/entities/blog.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { PostLike } from "./likes.entity";
import { Comment } from "src/modules/bloggers-platform/comments/domain/entities/comment.entity";

export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};

export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};

export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

@Entity({ name: 'posts' })
export class Post extends BaseEntity {
  @Column('varchar', { length: titleConstraints.maxLength, nullable: false })
  public title: string;
  
  @Column('varchar', { length: shortDescriptionConstraints.maxLength, nullable: false })
  public shortDescription: string;
  
  @Column('varchar', { length: contentConstraints.maxLength, nullable: false })
  public content: string;
  
  @ManyToOne( ()=> Blog, blog => blog.posts )
  blog: Blog

  @Column()
  public blogId: number;

  @OneToMany( () => PostLike, postLike => postLike.post )
  postLike: PostLike[]

  @OneToMany( () => Comment, comment => comment.post )
  comments: Comment[]
}