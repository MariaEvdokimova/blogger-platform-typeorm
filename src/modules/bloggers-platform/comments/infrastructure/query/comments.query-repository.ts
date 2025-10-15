import { Injectable } from "@nestjs/common";
import { CommentViewDto } from "../../api/view-dto/comments.view-dto";
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetCommentsQueryParams } from "../../api/input-dto/get-comments-query-params.input-dto";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { Comment } from "../../domain/entities/comment.entity";
import { CommentLike } from "../../domain/entities/comment-like.entity";
import { CommentsSortBy } from "../../api/input-dto/comments-sort-by";


@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository( Comment )
    private comment: Repository<Comment>,
    @InjectRepository( CommentLike )
    private commentLike: Repository<CommentLike>,  
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getFullInfoByIdOrNotFoundFail(commentId: number, userId: number): Promise<CommentViewDto> {
    const commentLikesQueryBuilder = this.commentLike
      .createQueryBuilder('cl')
      .select([
        'cl."commentId" AS "commentId"',
        `COUNT(*) FILTER (WHERE cl.status = 'Like') AS "likesCount"`,
        `COUNT(*) FILTER (WHERE cl.status = 'Dislike') AS "dislikesCount"`,
        `COALESCE( MAX(cl.status) FILTER (WHERE cl."userId" = :userId), 'None') AS "myStatus"`
      ])
      .setParameter( 'userId', userId )
      .where('cl."commentId" = :commentId', {commentId})
      .groupBy('cl."commentId"')

    const result = await this.comment
      .createQueryBuilder('c')
      .addCommonTableExpression( commentLikesQueryBuilder, 'cl' )
      .leftJoin( 'c.user', 'u' )
      .leftJoin( 'cl', 'cl', 'cl."commentId" = c.id' )
      .select([
        'c.id as id', 
        'c.content as content', 
      ])
      .addSelect('c."userId"', 'userId')
      .addSelect('c."createdAt"', 'createdAt')
      .addSelect('cl."likesCount"', 'likesCount')
      .addSelect('cl."dislikesCount"', 'dislikesCount')
      .addSelect('cl."myStatus"', 'myStatus')
      .addSelect('u.login', 'userLogin')
      .where('c.id = :id', { id: commentId })
      .andWhere('c."deletedAt" IS NULL')
      .getRawOne()
    
    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      }); 
    }

    return CommentViewDto.mapToView(result);
  }

  async getCommentsInPost(
    query: GetCommentsQueryParams, 
    postId: number, 
    userId: number 
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const sortColumns = {
      [CommentsSortBy.Content]: 'c.content', 
      [CommentsSortBy.CreatedAt]: 'c."createdAt"',
      [CommentsSortBy.UserLogin]: 'u.login',
    };
    const sortBy = sortColumns[query.sortBy] ?? 'c."createdAt"';

    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const commentsQueryBuilder = this.comment
      .createQueryBuilder('c')
      .where('c."postId" = :postId', { postId })
      .andWhere('c."deletedAt" IS NULL')

    const pagenatedCommentsQueryBuilder = commentsQueryBuilder
      .leftJoin('c.user', 'u')
      .select([
        'c.id', 
        'c.content', 
        'c.postId', 
        'c.userId', 
        'c.createdAt',
      ])
      .addSelect('u.login', 'userLogin')
      .orderBy( sortBy, sortDirection )
      .limit( query.pageSize )
      .offset( query.calculateSkip() )

    const likeStatusQueryBuilderFactory = ( 
      subQueryBuilder: SelectQueryBuilder<CommentLike>,
      commentListSubQuery: string
    ) => {
      return subQueryBuilder
        .select([
          'cl."commentId" AS "commentId"',
          `COUNT(*) FILTER (WHERE cl.status = 'Like') AS "likesCount"`,
          `COUNT(*) FILTER (WHERE cl.status = 'Dislike') AS "dislikesCount"`,
          `COALESCE(MAX(cl.status) FILTER (WHERE cl."userId" = :userId), 'None') AS "myStatus"`
        ])
        .setParameter('userId', userId)
        .from( CommentLike, 'cl' )
        .where(`cl."commentId" IN (${commentListSubQuery})`)
        .groupBy( 'cl."commentId"' )
    };

    const resultQuery = this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression( pagenatedCommentsQueryBuilder, 'c' )
      .select([
        'c.id as id', 
        'c.content as content',
      ])
      .addSelect('c."postId"', 'postId')
      .addSelect('c."userId"', 'userId')
      .addSelect('c."createdAt"', 'createdAt')
      .addSelect('c."userLogin"', 'userLogin')
      .addSelect('ls."likesCount"', 'likesCount')
      .addSelect('ls."dislikesCount"', 'dislikesCount')
      .addSelect('ls."myStatus"', 'myStatus')
      .from('c', 'c')
      .leftJoin( 
        qb => likeStatusQueryBuilderFactory( qb, 'SELECT id FROM c'),
        'ls',
        'ls."commentId" = c.id'
      )

      const [result, totalCount] = await Promise.all([
        resultQuery.getRawMany(),
        commentsQueryBuilder.getCount()
      ]);

    const items = result.map(CommentViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
