import { Injectable } from "@nestjs/common";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Comment } from "../domain/entities/comment.entity";

@Injectable()
export class CommentsRepository {

  constructor(
    @InjectRepository( Comment )
    private comment: Repository<Comment>,
  ) {}

  async save(dto: Comment): Promise<Comment> {
    return this.comment.save( dto );
  }

  async softDelete(id: number): Promise<void> {
    await this.comment.softDelete( id );
    return ;
  }

  async findById(id: number): Promise<Comment | null> {
    return this.comment.findOneBy({ id });
  }

  async findOrNotFoundFail(id: number): Promise<Comment> {
    const result = await this.findById( id );

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      });      
    }
    return result;
  }

  async verifyUserOwnership ( commentId: number, userId: number): Promise<Comment | null>  {
    return this.comment.findOne({
      where: {
        id: commentId,
        userId,
        deletedAt: IsNull()
      }
    })    
  }
}
