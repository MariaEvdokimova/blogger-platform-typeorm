import { Injectable } from "@nestjs/common";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { Blog } from "../domain/entities/blog.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository( Blog )
    private blog: Repository<Blog>,
  ) {}
 
  async save(dto: Blog): Promise<Blog> {
    return await this.blog.save( dto );
  }

  async softDelete(id: number): Promise<void> {
    await this.blog.softDelete( id );
    return ;
  }

  async findOrNotFoundFail(id: number): Promise<Blog> {
    const result = await this.blog.findOneBy({ id });

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      }); 
    }

    return result;
  }
}
