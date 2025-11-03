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

  private buildBasePostsQuery(
    query: GetPostsQueryParams,
    blogId?: number
  ): SelectQueryBuilder<Post> {
    const sortColumns = { 
      [PostsSortBy.CreatedAt]: 'p."createdAt"',
      [PostsSortBy.title]: 'p."title"', 
      [PostsSortBy.shortDescription]: 'p."shortDescription"', 
      [PostsSortBy.content]: 'p."content"', 
      [PostsSortBy.blogName]: 'b."name"'
    };
    const sortBy = sortColumns[query.sortBy] ?? 'p."createdAt"';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.post.createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select([
        'p.id AS id',
        'p.title AS title',
        'p."shortDescription" AS "shortDescription"',
        'p.content AS content',
        'p."blogId" AS "blogId"',
        'p."createdAt" AS "createdAt"',
        'b.name AS "blogName"',
      ])
      .where('p."deletedAt" IS NULL')
      .orderBy(sortBy, sortDirection)
      .limit(query.pageSize)
      .offset(query.calculateSkip());

    if (blogId) qb.andWhere('p."blogId" = :blogId', { blogId });

    return qb;
  }

  private buildLikeStatusSubQuery(
    sub: SelectQueryBuilder<PostLike>,
    postIdsSubQuery: SelectQueryBuilder<Post>,
    userId?: number
  ) {
    const base = sub
      .select([
        'pl."postId" AS "postId"',
        `COUNT(*) FILTER (WHERE pl.status = 'Like') AS "likesCount"`,
        `COUNT(*) FILTER (WHERE pl.status = 'Dislike') AS "dislikesCount"`,
      ])
      .from(PostLike, 'pl')
      .where(`pl."postId" IN (${postIdsSubQuery.getQuery()})`)
      .setParameters(postIdsSubQuery.getParameters())
      .groupBy('pl."postId"');

    if (userId) {
      base.addSelect(
        `COALESCE(MAX(pl.status) FILTER (WHERE pl."userId" = :userId), 'None') AS "myStatus"`
      );
    } else {
      base.addSelect(`'None' AS "myStatus"`);
    }

    return base;
  }

  private buildNewestLikesSubQuery(
    sub: SelectQueryBuilder<PostLike>,
    postIdsSubQuery: SelectQueryBuilder<Post>
  ) {
    const newestLikesInnerQueryBuilder = sub
      .from(PostLike, 'pl')
      .leftJoin('pl.user', 'u')
      .select('pl."postId"', 'postId')
      .addSelect('pl."userId"', 'userId')
      .addSelect('pl."createdAt"', 'createdAt')
      .addSelect('u.login', 'login')
      .addSelect( 'ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY pl."createdAt" DESC)', 'row_num')
      .where(`pl."postId" IN (${postIdsSubQuery.getQuery()})`)
      .andWhere(`pl.status = 'Like'`)
      .setParameters(postIdsSubQuery.getParameters());

    return this.dataSource
      .createQueryBuilder()
      .select('sub."postId"', 'postId')
      .addSelect(`
        COALESCE(
          JSONB_AGG(
            JSON_BUILD_OBJECT(
              'userId', sub."userId",
              'login', sub.login,
              'addedAt', sub."createdAt"
            )
            ORDER BY sub."createdAt" DESC
          ),
          '[]'::jsonb
        ) AS "newestLikes"
      `)
      .from(`(${newestLikesInnerQueryBuilder.getQuery()})`, 'sub')
      .where('sub.row_num <= 3')
      .groupBy('sub."postId"');
  }

  private async executePostsQuery(
    query: GetPostsQueryParams,
    postsQb: SelectQueryBuilder<Post>,
    userId?: number
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const postIdsSubQuery = postsQb.clone().select('p.id');

    const likeStatusSubQueryBuilder = this.buildLikeStatusSubQuery(
      this.dataSource.createQueryBuilder(),
      postIdsSubQuery,
      userId
    );

    const newestLikesSubQueryBuilder = this.buildNewestLikesSubQuery(
      this.dataSource.createQueryBuilder(),
      postIdsSubQuery
    );

     const sortColumns = { 
      [PostsSortBy.CreatedAt]: '"createdAt"',
      [PostsSortBy.title]: '"title"',
      [PostsSortBy.shortDescription]: '"shortDescription"',
      [PostsSortBy.content]: '"content"',
      [PostsSortBy.blogName]: '"blogName"'
    };
    const sortBy = sortColumns[query.sortBy] ?? '"createdAt"';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const resultQuery = this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression(postsQb, 'p')
      .from('p', 'p')
      .leftJoin(`(${likeStatusSubQueryBuilder.getQuery()})`, 'ls', 'ls."postId" = p.id')
      .leftJoin(`(${newestLikesSubQueryBuilder.getQuery()})`, 'nl', 'nl."postId" = p.id')
      .select([
        'p.id',
        'p.title',
        'p."shortDescription"',
        'p.content',
        'p."blogId"',
        'p."createdAt"',
        'p."blogName"',
        'ls."likesCount"',
        'ls."dislikesCount"',
        'ls."myStatus"',
        'nl."newestLikes"',
      ])
      .orderBy(sortBy, sortDirection);

    if (userId) resultQuery.setParameter('userId', userId);

    const [rows, totalCount] = await Promise.all([
      resultQuery.getRawMany(),
      postsQb.getCount(),
    ]);

    return PaginatedViewDto.mapToView({
      items: rows.map(PostViewDto.mapToView),
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getAll(query: GetPostsQueryParams, userId?: number) {
    const baseQb = this.buildBasePostsQuery(query);
    return this.executePostsQuery(query, baseQb, userId);
  }

  async getPostsInBlog(query: GetPostsQueryParams, blogId: number, userId?: number) {
    const baseQb = this.buildBasePostsQuery(query, blogId);
    return this.executePostsQuery(query, baseQb, userId);
  }

  // async getPostsInBlog( query: GetPostsQueryParams, blogId: number, userId?: number ): Promise<PaginatedViewDto<PostViewDto[]>> {
  //   const sortColumns = { 
  //     [PostsSortBy.CreatedAt]: 'p."createdAt"',
  //     [PostsSortBy.title]: 'p."title"', 
  //     [PostsSortBy.shortDescription]: 'p."shortDescription"', 
  //     [PostsSortBy.content]: 'p."content"', 
  //     [PostsSortBy.blogName]: 'b."name"'
  //   };
  //   const sortBy = sortColumns[query.sortBy] ?? 'p."createdAt"';

  //   const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  //   const postsQueryBuilder = this.post
  //     .createQueryBuilder('p')
  //     .where('p."blogId" = :blogId', { blogId })
  //     .andWhere('p."deletedAt" IS NULL')

  //   const pagenatedPostsQueryBuilder = postsQueryBuilder
  //     .leftJoin('p.blog', 'b')
  //     .select('p.id', 'id') 
  //     .addSelect('p.title', 'title')
  //     .addSelect('p."shortDescription"', 'shortDescription')
  //     .addSelect('p.content', 'content')
  //     .addSelect('p."blogId"', 'blogId')
  //     .addSelect('p."createdAt"', 'createdAt')
  //     .addSelect('b.name', 'blogName')
  //     .orderBy( sortBy, sortDirection )
  //     .limit( query.pageSize )
  //     .offset( query.calculateSkip() )

  //   const postIdsSubQuery = pagenatedPostsQueryBuilder.clone().select('p.id');

  //   const likeStatusQueryBuilderFactory = ( 
  //     subQueryBuilder: SelectQueryBuilder<PostLike>,
  //     userId: number | undefined
  //   ) => {
  //     return subQueryBuilder
  //       .select([
  //         'pl."postId" AS "postId"',
  //         `COUNT(*) FILTER (WHERE pl.status = 'Like') AS "likesCount"`,
  //         `COUNT(*) FILTER (WHERE pl.status = 'Dislike') AS "dislikesCount"`,
  //         userId 
  //           ? `COALESCE(MAX(pl.status) FILTER (WHERE pl."userId" = :userId), 'None') AS "myStatus"`
  //           : `'None' AS "myStatus"`
  //       ])
  //       .from( PostLike, 'pl' )
  //       .where(`pl."postId" IN (${postIdsSubQuery.getQuery()})`)
  //       .setParameters(postIdsSubQuery.getParameters())
  //       .groupBy( 'pl."postId"' )
  //   };
    
  //   const newestLikesSubQueryBuilderFactory = ( subQueryBuilder: SelectQueryBuilder<PostLike> ) => {
  //     return subQueryBuilder
  //       .from( PostLike, 'pl')
  //       .leftJoin('pl.user', 'u')
  //       .select('pl."postId"', 'postId')
  //       .addSelect('pl."userId"', 'userId')
  //       .addSelect('pl."createdAt"', 'createdAt')
  //       .addSelect('u.login', 'login')
  //       .addSelect('ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY pl."createdAt" DESC)', 'row_num')
  //       .where(`pl."postId" IN (${postIdsSubQuery.getQuery()})`)
  //       .setParameters(postIdsSubQuery.getParameters())
  //       .andWhere(`pl.status = 'Like'`)
  //   }

  //   const newestLikesListSubQuery = pagenatedPostsQueryBuilder.subQuery()
  //   .select('sub."postId"', 'postId')
  //   .addSelect(`
  //     COALESCE(
  //       JSONB_AGG(
  //         JSON_BUILD_OBJECT(
  //           'userId', sub."userId",
  //           'login', sub.login,
  //           'addedAt', sub."createdAt"
  //         )
  //         ORDER BY sub."createdAt" DESC
  //       ),
  //       '[]'::jsonb
  //     )
  //   `, 'newestLikes')
  //   .from(`(${newestLikesSubQueryBuilderFactory(pagenatedPostsQueryBuilder.subQuery()).getQuery()})`, 'sub')
  //   .where('sub.row_num <= 3')
  //   .groupBy('sub."postId"');

  //   const resultQuery = this.dataSource
  //     .createQueryBuilder()
  //     .addCommonTableExpression( pagenatedPostsQueryBuilder, 'p' )      
  //     .from('p', 'p')
  //     .leftJoin( 
  //       qb => likeStatusQueryBuilderFactory( qb, userId),
  //       'ls',
  //       'ls."postId" = p.id'
  //     )     
  //     .leftJoin(
  //       `(${newestLikesListSubQuery.getQuery()})`,
  //       'nl',
  //       'nl."postId" = p.id',
  //     )
  //     .select('p.id', 'id')
  //     .addSelect('p.title', 'title')
  //     .addSelect('p."shortDescription"', 'shortDescription')
  //     .addSelect('p.content', 'content')
  //     .addSelect('p."blogId"', 'blogId')
  //     .addSelect('p."createdAt"', 'createdAt')
  //     .addSelect('p."blogName"', 'blogName')
  //     .addSelect('ls."likesCount"', 'likesCount')
  //     .addSelect('ls."dislikesCount"', 'dislikesCount')
  //     .addSelect('ls."myStatus"', 'myStatus')  
  //     .addSelect('nl."newestLikes"', 'newestLikes')
     
  //     if ( userId ) {
  //       resultQuery.setParameter( 'userId', userId )
  //     }

  //   const [result, totalCount] = await Promise.all([
  //     resultQuery.getRawMany(),
  //     postsQueryBuilder.getCount()
  //   ]);

  //   const items = result.map(PostViewDto.mapToView);

  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount: totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }
  
  // async getAll(
  //   query: GetPostsQueryParams,
  //   userId: number
  // ): Promise<PaginatedViewDto<PostViewDto[]>> {
  //   const sortColumns = { 
  //     [PostsSortBy.CreatedAt]: 'p."createdAt"',
  //     [PostsSortBy.title]: 'p.title', 
  //     [PostsSortBy.shortDescription]: 'p."shortDescription"', 
  //     [PostsSortBy.content]: 'p.content', 
  //     [PostsSortBy.blogName]: 'b.name'
  //   };
  //   const sortBy = sortColumns[query.sortBy] ?? 'p."createdAt"';

  //   const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  //   const postsQueryBuilder = this.post
  //     .createQueryBuilder('p')
  //     .where('p."deletedAt" IS NULL')

  //   const pagenatedPostsQueryBuilder = postsQueryBuilder
  //     .leftJoin('p.blog', 'b')
  //     .select('p.id', 'id')
  //     .addSelect('p.title', 'title') 
  //     .addSelect('p."shortDescription"', 'shortDescription') 
  //     .addSelect('p."content"', 'content') 
  //     .addSelect('p."blogId"', 'blogId') 
  //     .addSelect('p."createdAt"', 'createdAt')
  //     .addSelect('b.name', 'blogName')
  //     .orderBy( sortBy, sortDirection )
  //     .limit( query.pageSize )
  //     .offset( query.calculateSkip() )
    
  //   const postIdsSubQuery = pagenatedPostsQueryBuilder.clone().select('p.id');

  //   const likeStatusQueryBuilderFactory = ( 
  //     subQueryBuilder: SelectQueryBuilder<PostLike>
  //   ) => {
  //     return subQueryBuilder
  //       .select([
  //         'pl."postId" AS "postId"',
  //         `COUNT(*) FILTER (WHERE pl.status = 'Like') AS "likesCount"`,
  //         `COUNT(*) FILTER (WHERE pl.status = 'Dislike') AS "dislikesCount"`,
  //       ])
  //       .addSelect(`COALESCE(MAX(pl.status) FILTER (WHERE pl.userId = :userId), 'None')`, "myStatus")
  //       .from( PostLike, 'pl' )
  //       .where(`pl."postId" IN (${postIdsSubQuery.getQuery()})`)
  //       .setParameters(postIdsSubQuery.getParameters())
  //       .groupBy( 'pl."postId"' )
  //   };

  //   const newestLikesSubQueryBuilderFactory = ( subQueryBuilder: SelectQueryBuilder<PostLike> ) => {
  //     return subQueryBuilder
  //       .from( PostLike, 'pl')
  //       .leftJoin('pl.user', 'u')
  //       .select('pl."postId"', 'postId')
  //       .addSelect('pl."userId"', 'userId')
  //       .addSelect('pl."createdAt"', 'createdAt')
  //       .addSelect('u.login', 'login')
  //       .addSelect('ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY pl."createdAt" DESC)', 'row_num')
  //       .where(`pl."postId" IN (${postIdsSubQuery.getQuery()})`)
  //       .setParameters(postIdsSubQuery.getParameters())
  //       .andWhere(`pl.status = 'Like'`)
  //   }

  //   const newestLikesListSubQuery = pagenatedPostsQueryBuilder.subQuery()
  //   .select('sub."postId"', 'postId')
  //   .addSelect(`
  //     COALESCE(
  //       JSONB_AGG(
  //         JSON_BUILD_OBJECT(
  //           'userId', sub."userId",
  //           'login', sub.login,
  //           'addedAt', sub."createdAt"
  //         )
  //         ORDER BY sub."createdAt" DESC
  //       ),
  //       '[]'::jsonb
  //     )
  //   `, 'newestLikes')
  //   .from(`(${newestLikesSubQueryBuilderFactory(pagenatedPostsQueryBuilder.subQuery()).getQuery()})`, 'sub')
  //   .where('sub.row_num <= 3')
  //   .groupBy('sub."postId"');

  //   const resultQuery = this.dataSource
  //     .createQueryBuilder()
  //     .addCommonTableExpression( pagenatedPostsQueryBuilder, 'p' )
  //     .from('p', 'p')
  //     .leftJoin( 
  //       qb => likeStatusQueryBuilderFactory( qb ),
  //       'ls',
  //       'ls."postId" = p.id'
  //     )
  //     .leftJoin(
  //       `(${newestLikesListSubQuery.getQuery()})`,
  //       'nl',
  //       'nl."postId" = p.id',
  //     )
  //     .select('p.id', 'id')
  //     .addSelect('p.title', 'title')
  //     .addSelect('p."shortDescription"', 'shortDescription')
  //     .addSelect('p.content', 'content')
  //     .addSelect('p."blogId"', 'blogId')
  //     .addSelect('p."createdAt"', 'createdAt')
  //     .addSelect('p."blogName"', 'blogName')
  //     .addSelect('ls."likesCount"', 'likesCount')
  //     .addSelect('ls."dislikesCount"', 'dislikesCount')
  //     .addSelect('ls."myStatus"', 'myStatus')      
  //     .addSelect('nl."newestLikes"', 'newestLikes')
  //     .setParameter( 'userId', userId )

  //   const [result, totalCount] = await Promise.all([
  //     resultQuery.getRawMany(),
  //     postsQueryBuilder.getCount()
  //   ]);

  //   const items = result.map(PostViewDto.mapToView);

  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }

}
