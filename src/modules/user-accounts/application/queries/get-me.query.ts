import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserContextDto } from "../../dto/user-context.dto";
import { AuthQueryRepository } from "../../infrastructure/query/auth.query-repository";
import { MeViewDto } from "../../api/view-dto/users.view-dto";

export class GetMeQuery {
  constructor(public dto: UserContextDto) {}
}

@QueryHandler(GetMeQuery)
export class GetMeQueryHandler
  implements IQueryHandler<GetMeQuery, MeViewDto>
{
  constructor(private authQueryRepository: AuthQueryRepository) {}

  async execute({ dto }: GetMeQuery) {
    return this.authQueryRepository.me(dto.id);
  }
}
