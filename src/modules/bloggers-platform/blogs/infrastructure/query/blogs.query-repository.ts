import { Injectable } from "@nestjs/common";
import { BlogViewDto } from "../../api/view-dto/blogs.view-dto";
import { GetBlogsQueryParams } from "../../api/input-dto/get-blogs-query-params.input-dto";
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Blog } from "../../domain/entities/blog.entity";

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository( Blog )
    private blog: Repository<Blog>,
  ) {}

  async getByIdOrNotFoundFail(id: number): Promise<Blog> {
    const result = await this.blog.findOneBy({id});

    if ( !result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not found',
      }); 
    }
  
    return result;
  }

  async getToViewByIdOrNotFoundFail(id: number): Promise<BlogViewDto> {
    const result = await this.getByIdOrNotFoundFail(id);
    return BlogViewDto.mapToView( result );
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const blogsSelectQueryBuilder = this.blog
      .createQueryBuilder('b')
      .select('b.id', 'id')
      .addSelect('b.name', 'name')
      .addSelect('b.description', 'description')
      .addSelect('b."websiteUrl"', 'websiteUrl')
      .addSelect('b."isMembership"', 'isMembership')
      .addSelect('b."createdAt"', 'createdAt')
      .where('b."deletedAt" IS NULL')
      .orderBy( `b."${sortBy}"`, sortDirection )
      .limit( query.pageSize )
      .offset( query.calculateSkip() )
      
    if (query.searchNameTerm) {
      blogsSelectQueryBuilder
      .andWhere('b.name ILIKE :name ', { name: `%${query.searchNameTerm}%` })
    }

    const [ raw, totalCount ] = await Promise.all([
      blogsSelectQueryBuilder.getRawMany(),
      blogsSelectQueryBuilder.getCount()
    ]);

    const items = raw.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount: totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
