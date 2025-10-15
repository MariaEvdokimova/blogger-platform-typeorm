import { Injectable } from "@nestjs/common";
import { CommentLike } from "../domain/entities/comment-like.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class CommentLikesRepository {

  constructor(
    @InjectRepository( CommentLike )
    private commentLike: Repository<CommentLike>,
  ) {}

  async save(dto: CommentLike): Promise<CommentLike> {
    return this.commentLike.save( dto );
  }

  async findUserCommentStatus( commentId: number, userId: number ): Promise<CommentLike | null> {
    return this.commentLike.findOne({
      where: {
        commentId,
        userId
      }
    });
  }
}
