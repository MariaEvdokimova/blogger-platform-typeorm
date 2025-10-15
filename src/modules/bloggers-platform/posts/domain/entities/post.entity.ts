import { BaseEntity } from "@src/core/entities/base.entity";
import { Blog } from "@src/modules/bloggers-platform/blogs/domain/entities/blog.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { PostLike } from "./likes.entity";
import { Comment } from "@src/modules/bloggers-platform/comments/domain/entities/comment.entity";
import { CreatePostInBlogInputDto } from "@src/modules/bloggers-platform/blogs/api/input-dto/post-in-blog.input-dto";

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
  @Column({ type: 'varchar', collation: 'C', length: titleConstraints.maxLength, nullable: false })
  public title: string;
  
  @Column({ type: 'varchar', collation: 'C', length: shortDescriptionConstraints.maxLength, nullable: false })
  public shortDescription: string;
  
  @Column({ type: 'varchar', collation: 'C', length: contentConstraints.maxLength, nullable: false })
  public content: string;
  
  @ManyToOne( ()=> Blog, blog => blog.posts )
  blog: Blog

  @Column()
  public blogId: number;

  @OneToMany( () => PostLike, postLike => postLike.post )
  postLike: PostLike[]

  @OneToMany( () => Comment, comment => comment.post )
  comments: Comment[];

  static create( dto: CreatePostInBlogInputDto, blogId: number ): Post {
    const post = new this();
    post.title =dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = blogId;

    return post;
  }
}