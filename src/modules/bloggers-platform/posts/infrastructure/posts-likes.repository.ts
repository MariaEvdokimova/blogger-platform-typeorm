import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostLike } from "../domain/entities/likes.entity";
import { Repository } from "typeorm";

@Injectable()
export class PostLikesRepository {

  constructor(
    @InjectRepository( PostLike )
    private postLike: Repository<PostLike>,
  ) {}

  async save(dto: PostLike): Promise<PostLike> {
    return this.postLike.save( dto );
  }

  async findUserPostStatus( postId: number, userId: number ): Promise<PostLike | null> {
    return this.postLike.findOne({
      where: { postId, userId }
    })
  }
}
