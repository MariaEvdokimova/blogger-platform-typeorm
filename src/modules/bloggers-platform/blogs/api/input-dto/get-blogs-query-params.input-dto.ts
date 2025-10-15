import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogsSortBy } from './blogs-sort-by';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetBlogsQueryParams extends BaseQueryParams {
  @IsEnum(BlogsSortBy)
  sortBy = BlogsSortBy.CreatedAt;

  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}
