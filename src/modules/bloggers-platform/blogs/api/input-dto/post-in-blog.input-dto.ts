import { ApiProperty } from "@nestjs/swagger";
import { IsStringWithTrim } from "../../../../../core/decorators/validation/is-string-with-trim";
import { contentConstraints, shortDescriptionConstraints, titleConstraints } from "@src/modules/bloggers-platform/posts/domain/entities/post.entity";

//Сюда могут быть добавлены декораторы swagger
export class CreatePostInBlogInputDto {
  @ApiProperty({
        minLength: titleConstraints.minLength,
        maxLength: titleConstraints.maxLength,
        example: 'title',
      })
      @IsStringWithTrim(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;
  
    @ApiProperty({
      minLength: shortDescriptionConstraints.minLength,
      maxLength: shortDescriptionConstraints.maxLength,
      example: 'shortDescriptionConstraints',
    })
    @IsStringWithTrim(shortDescriptionConstraints.minLength, shortDescriptionConstraints.maxLength)
  shortDescription: string;
  
  @ApiProperty({
      minLength: contentConstraints.minLength,
      maxLength: contentConstraints.maxLength,
      example: 'shortDescriptionConstraints',
    })
    @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;
}
