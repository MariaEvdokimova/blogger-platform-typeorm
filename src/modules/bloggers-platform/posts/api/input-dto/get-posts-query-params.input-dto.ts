import { IsEnum } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { PostsSortBy } from "./posts-sort-by";

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetPostsQueryParams extends BaseQueryParams {
  @IsEnum(PostsSortBy)
  sortBy = PostsSortBy.CreatedAt;  
}
