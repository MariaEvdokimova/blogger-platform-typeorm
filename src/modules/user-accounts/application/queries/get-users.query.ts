import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UsersQueryRepository } from "../../infrastructure/query/users.query-repository";
import { GetUsersQueryParams } from "../../api/input-dto/get-users-query-params.input-dto";

export class GetUsersQuery {
  constructor(public dto: GetUsersQueryParams) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler
  implements IQueryHandler<GetUsersQuery>
{
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async execute({ dto }: GetUsersQuery) {
    return this.usersQueryRepository.getAll( dto );
  }
}
