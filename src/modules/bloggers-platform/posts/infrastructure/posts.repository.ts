import { Injectable } from "@nestjs/common";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "../domain/entities/post.entity";
import { Repository } from "typeorm";

@Injectable()
export class PostsRepository {

  constructor(
    @InjectRepository( Post )
    private post: Repository<Post>,
  ) {}

  async save(dto: Post): Promise<Post> {
    return this.post.save( dto );
  }
  
  async softDelete(id: number): Promise<void> {
    await this.post.softDelete( id );
    return ;
  }

  async findById(id: number): Promise<Post | null | undefined> {
    return this.post.findOneBy({ id })
  }

  async findOrNotFoundFail(id: number): Promise<Post> {
    const result = await this.findById( id );

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      }); 
    }

    return result;
  }
}
