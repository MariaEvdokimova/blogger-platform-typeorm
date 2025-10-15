import { IsEnum } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { CommentsSortBy } from "./comments-sort-by";


//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetCommentsQueryParams extends BaseQueryParams {
  @IsEnum(CommentsSortBy)
  sortBy = CommentsSortBy.CreatedAt;
}
