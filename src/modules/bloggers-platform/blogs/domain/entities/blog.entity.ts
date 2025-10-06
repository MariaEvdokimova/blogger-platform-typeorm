import { BaseEntity } from "src/core/entities/base.entity";
import { Post } from "src/modules/bloggers-platform/posts/domain/entities/post.entity";
import { Column, Entity, OneToMany } from "typeorm";

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
  @Column('varchar', { length: nameConstraints.maxLength, nullable: false })
  public name: string;
  
  @Column('varchar', { length: descriptionConstraints.maxLength, nullable: false })
  public description: string;
  
  @Column('varchar', { length: websiteUrlConstraints.maxLength, nullable: false })
  public websiteUrl: string;
  
  @Column('boolean', { default: false })
  public isMembership: boolean;

  @OneToMany( () => Post, post => post.blog )
  posts: Post[]
}