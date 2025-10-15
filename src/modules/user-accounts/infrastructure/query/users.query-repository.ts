import { Injectable } from "@nestjs/common";
import { UserViewDto } from "../../api/view-dto/users.view-dto";
import { GetUsersQueryParams } from "../../api/input-dto/get-users-query-params.input-dto";
import { PaginatedViewDto } from "../../../../core/dto/base.paginated.view-dto";
import { DomainException } from "@src/core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "@src/core/exceptions/domain-exception-codes";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../domain/entities/user.entity";
import { FindOptionsWhere, ILike, IsNull, Repository } from "typeorm";

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository( User )
    private user: Repository<User>,
  ) {}

  async getByIdOrNotFoundFail(id: number): Promise<UserViewDto> {
    const result = await this.findById(id)
    if ( !result ) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'not fouund',
      }); 
    }
    return result;
  }

  async findById( id: number ): Promise<UserViewDto | null> {
    const result = await this.user.findOneBy({ id })
    return result ? UserViewDto.mapToView(result) : null;
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
   
    const where: FindOptionsWhere<User>[] = [];
    if (query.searchLoginTerm || query.searchEmailTerm) {
      if (query.searchLoginTerm) {
        where.push({
          login: ILike(`%${query.searchLoginTerm}%`),
          deletedAt: IsNull(),
        })
      }
      if (query.searchEmailTerm) {
        where.push({
          email: ILike(`%${query.searchEmailTerm}%`),
          deletedAt: IsNull(),
        })
      }
    } else {
      where.push({
        deletedAt: IsNull(),
      })
    }

    const [users, totalCount] = await this.user.findAndCount({
    where,
    order: {
      [sortBy]: sortDirection,
    },
    skip: query.calculateSkip(),
    take: query.pageSize,
  });

  const items = users.map(UserViewDto.mapToView);

  return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
