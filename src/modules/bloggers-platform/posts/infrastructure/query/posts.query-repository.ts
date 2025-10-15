import { Injectable } from "@nestjs/common";
import { PostViewDto } from "../../api/view-dto/posts.view-dto";
import { GetPostsQueryParams } from "../../api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, IsNull, Repository, SelectQueryBuilder } from "typeorm";
import { Post } from "../../domain/entities/post.entity";
import { PostLike } from "../../domain/entities/likes.entity";
import { PostsSortBy } from "../../api/input-dto/posts-sort-by";

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository( Post )
    private post: Repository<Post>,
    @InjectRepository( PostLike )
    private postLikes: Repository<PostLike>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getByIdOrNotFoundFail(id: number ): Promise<PostViewDto> {
    const result = await this.post.findOne({
      relations: {
        blog: true
      },
      where: {
        id,
        deletedAt: IsNull()
      }
    });

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      }); 
    }

    return PostViewDto.mapToView( {
      id: result.id,
      title: result.title,
      shortDescription: result.shortDescription,
      content: result.content,
      blogId: result.blogId,
      createdAt: result.createdAt,
      blogName: result.blog.name,
      likesCount: 0,
      dislikesCount: 0,
      myStatus: null,
      newestLikes: []
    });
  }

  async getPostsInBlog( query: GetPostsQueryParams, blogId: number, userId?: number ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const sortColumns = { 
      [PostsSortBy.CreatedAt]: 'p."createdAt"',
      [PostsSortBy.title]: 'p."title"', 
      [PostsSortBy.shortDescription]: 'p."shortDescription"', 
      [PostsSortBy.content]: 'p."content"', 
      [PostsSortBy.blogName]: 'b."name"'
    };
    const sortBy = sortColumns[query.sortBy] ?? 'p."createdAt"';

    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const postsQueryBuilder = this.post
      .createQueryBuilder('p')
      .where('p."blogId" = :blogId', { blogId })
      .andWhere('p."deletedAt" IS NULL')

    const pagenatedPostsQueryBuilder = postsQueryBuilder
      .leftJoin('p.blog', 'b')
      .select('p.id', 'id') 
      .addSelect('p.title', 'title')
      .addSelect('p."shortDescription"', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p."blogId"', 'blogId')
      .addSelect('p."createdAt"', 'createdAt')
      .addSelect('b.name', 'blogName')
      .orderBy( sortBy, sortDirection )
      .limit( query.pageSize )
      .offset( query.calculateSkip() )

    const likeStatusQueryBuilderFactory = ( 
      subQueryBuilder: SelectQueryBuilder<PostLike>,
      postListSubQuery: string,
      userId: number | undefined
    ) => {
      return subQueryBuilder
        .select([
          'pl."postId" AS "postId"',
          `COUNT(*) FILTER (WHERE pl.status = 'Like') AS "likesCount"`,
          `COUNT(*) FILTER (WHERE pl.status = 'Dislike') AS "dislikesCount"`,
          userId 
            ? `COALESCE(MAX(pl.status) FILTER (WHERE pl."userId" = :userId), 'None') AS "myStatus"`
            : `'None' AS "myStatus"`
        ])
        .from( PostLike, 'pl' )
        .where(`pl."postId" IN (${postListSubQuery})`)
        .groupBy( 'pl."postId"' )
    };
      
    const resultQuery = this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression( pagenatedPostsQueryBuilder, 'p' )
      .select('p.id', 'id')
      .addSelect('p.title', 'title')
      .addSelect('p."shortDescription"', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p."blogId"', 'blogId')
      .addSelect('p."createdAt"', 'createdAt')
      .addSelect('p."blogName"', 'blogName')
      .addSelect('ls."likesCount"', 'likesCount')
      .addSelect('ls."dislikesCount"', 'dislikesCount')
      .addSelect('ls."myStatus"', 'myStatus')
      .from('p', 'p')
      .leftJoin( 
        qb => likeStatusQueryBuilderFactory( qb, 'SELECT id FROM p', userId),
        'ls',
        'ls."postId" = p.id'
      )      
     
      if ( userId ) {
        resultQuery.setParameter( 'userId', userId )
      }

    const [result, totalCount] = await Promise.all([
      resultQuery.getRawMany(),
      postsQueryBuilder.getCount()
    ]);

    const items = result.map(PostViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount: totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getFullInfoByIdOrNotFoundFail(id: number, userId: number ): Promise<PostViewDto> {
    const postsListQueryBuilder = this.post
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select('p.id', 'id') 
      .addSelect('p.title', 'title') 
      .addSelect('p."shortDescription"', 'shortDescription') 
      .addSelect('p.content', 'content') 
      .addSelect('p."blogId"', 'blogId') 
      .addSelect('p."createdAt"', 'createdAt')
      .addSelect('b.name', 'blogName')
      .where('p.id = :id', { id })
      .andWhere('p."deletedAt" IS NULL')

    const postLikesQueryBuilder = this.postLikes
      .createQueryBuilder('pl')
      .select([
        'pl."postId" AS "postId"',
        `COUNT(*) FILTER (WHERE pl.status = 'Like') AS "likesCount"`,
        `COUNT(*) FILTER (WHERE pl.status = 'Dislike') AS "dislikesCount"`,
        `COALESCE(
          MAX(status) FILTER (WHERE pl."userId" = :userId),
          'None'
        ) AS "myStatus"`
      ])
      .setParameter('userId', userId)
      .where('pl."postId" = :postId', { postId: id })
      .groupBy('pl."postId"')

    const newestLikesSubQueryBuilderFactory = ( subQueryBuilder: SelectQueryBuilder<PostLike> ) => {
      return subQueryBuilder
        .from( PostLike, 'pl')
        .leftJoin('pl.user', 'u')
        .select('pl."postId"', 'postId')
        .addSelect('pl."userId"', 'userId')
        .addSelect('pl."createdAt"', 'createdAt')
        .addSelect('u.login', 'login')
        .where('pl."postId" = :postId', { postId: id })
        .andWhere(`pl.status = 'Like'`)
        .orderBy( 'pl."createdAt"', 'DESC')
        .limit( 3 )
    }

    const newestLikesQueryBuilder = this.dataSource
      .createQueryBuilder()
      .from( newestLikesSubQueryBuilderFactory, 'nl' )
      .select('nl."postId"', 'postId')
      .addSelect(
        `COALESCE(
          JSONB_AGG(
            JSON_BUILD_OBJECT('userId', nl."userId"::text, 'login', nl.login, 'addedAt', nl."createdAt")
            ORDER BY nl."createdAt" DESC
          ),
          '[]'::jsonb)`
      , 'newestLikes')
      .groupBy('nl."postId"')

    const result = await this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression( postsListQueryBuilder, 'p' )
      .addCommonTableExpression( postLikesQueryBuilder, 'pl' )
      .addCommonTableExpression( newestLikesQueryBuilder, 'nl' )
      .select('p.id', 'id')
      .addSelect('p.title', 'title')
      .addSelect('p."shortDescription"', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p."blogId"', 'blogId')
      .addSelect('p."createdAt"', 'createdAt')
      .addSelect('p."blogName"', 'blogName')
      .addSelect('pl."likesCount"', 'likesCount')
      .addSelect('pl."dislikesCount"', 'dislikesCount')
      .addSelect('pl."myStatus"', 'myStatus')
      .addSelect('nl."newestLikes"', 'newestLikes')
      .from('p', 'p')
      .leftJoin('pl', 'pl', 'pl."postId" = p.id')
      .leftJoin('nl', 'nl', 'nl."postId" = p.id')
      .setParameter('userId', userId)
      .getRawOne()

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      }); 
    }

    return PostViewDto.mapToView(result);
  }

  async getAll(
    query: GetPostsQueryParams,
    userId: number
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const sortColumns = { 
      [PostsSortBy.CreatedAt]: 'p."createdAt"',
      [PostsSortBy.title]: 'p.title', 
      [PostsSortBy.shortDescription]: 'p."shortDescription"', 
      [PostsSortBy.content]: 'p.content', 
      [PostsSortBy.blogName]: 'b.name'
    };
    const sortBy = sortColumns[query.sortBy] ?? 'p."createdAt"';

    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const postsQueryBuilder = this.post
      .createQueryBuilder('p')
      .where('p."deletedAt" IS NULL')

    const pagenatedPostsQueryBuilder = postsQueryBuilder
      .leftJoin('p.blog', 'b')
      .select('p.id', 'id')
      .addSelect('p.title', 'title') 
      .addSelect('p."shortDescription"', 'shortDescription') 
      .addSelect('p."content"', 'content') 
      .addSelect('p."blogId"', 'blogId') 
      .addSelect('p."createdAt"', 'createdAt')
      .addSelect('b.name', 'blogName')
      .orderBy( sortBy, sortDirection )
      .limit( query.pageSize )
      .offset( query.calculateSkip() )
    
    const likeStatusQueryBuilderFactory = ( 
      subQueryBuilder: SelectQueryBuilder<PostLike>,
      postListSubQuery: string
    ) => {
      return subQueryBuilder
        .select([
          'pl."postId" AS "postId"',
          `COUNT(*) FILTER (WHERE pl.status = 'Like') AS "likesCount"`,
          `COUNT(*) FILTER (WHERE pl.status = 'Dislike') AS "dislikesCount"`,
        ])
        .addSelect(`COALESCE(MAX(pl.status) FILTER (WHERE pl.userId = :userId), 'None')`, "myStatus")
        .from( PostLike, 'pl' )
        .where(`pl."postId" IN (${postListSubQuery})`)
        .groupBy( 'pl."postId"' )
    };
      
    const resultQuery = this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression( pagenatedPostsQueryBuilder, 'p' )
      .from('p', 'p')
      .select('p.id', 'id')
      .addSelect('p.title', 'title')
      .addSelect('p."shortDescription"', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p."blogId"', 'blogId')
      .addSelect('p."createdAt"', 'createdAt')
      .addSelect('p."blogName"', 'blogName')
      .addSelect('ls."likesCount"', 'likesCount')
      .addSelect('ls."dislikesCount"', 'dislikesCount')
      .addSelect('ls."myStatus"', 'myStatus')
      .leftJoin( 
        qb => likeStatusQueryBuilderFactory( qb, 'SELECT id FROM p'),
        'ls',
        'ls."postId" = p.id'
      )
      .setParameter( 'userId', userId )

    const [result, totalCount] = await Promise.all([
      resultQuery.getRawMany(),
      postsQueryBuilder.getCount()
    ]);

    const items = result.map(PostViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
