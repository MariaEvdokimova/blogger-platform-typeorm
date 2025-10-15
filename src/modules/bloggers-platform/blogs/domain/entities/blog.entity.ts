import { BaseEntity } from "@src/core/entities/base.entity";
import { Post } from "@src/modules/bloggers-platform/posts/domain/entities/post.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { CreateBlogInputDto } from "../../api/input-dto/blogs.input-dto";

export const nameConstraints = {
  minLength: 1,
  maxLength: 15,
};

export const descriptionConstraints = {
  minLength: 1,
  maxLength: 500,
};

export const websiteUrlConstraints = {
  minLength: 1,
  maxLength: 100,
  match: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
};

@Entity({ name: 'blogs'} )
export class Blog extends BaseEntity {
  @Column( { type: 'varchar', collation: 'C', length: nameConstraints.maxLength, nullable: false })
  public name: string;
  
  @Column({ type: 'varchar', collation: 'C', length: descriptionConstraints.maxLength, nullable: false })
  public description: string;
  
  @Column({ type: 'varchar', collation: 'C', length: websiteUrlConstraints.maxLength, nullable: false })
  public websiteUrl: string;
  
  @Column('boolean', { default: false })
  public isMembership: boolean;

  @OneToMany( () => Post, post => post.blog )
  posts: Post[];

  static create( dto: CreateBlogInputDto ): Blog {
    const blog = new this();
      blog.name = dto.name;
      blog.description = dto.description;
      blog.websiteUrl = dto.websiteUrl;
    return blog;
  }
}