import { ApiProperty } from "@nestjs/swagger";
import { descriptionConstraints, nameConstraints, websiteUrlConstraints } from "../domain/entities/blog.entity";
import { IsStringWithTrim } from "../../../../core/decorators/validation/is-string-with-trim";
import { Matches } from "class-validator";

export class UpdateBlogDto {
  @ApiProperty({
      minLength: nameConstraints.minLength,
      maxLength: nameConstraints.maxLength,
      example: 'blog',
    })
    @IsStringWithTrim(nameConstraints.minLength, nameConstraints.maxLength)
  name:	string;

  @ApiProperty({
    minLength: descriptionConstraints.minLength,
    maxLength: descriptionConstraints.maxLength,
    example: 'description',
  })
  @IsStringWithTrim(descriptionConstraints.minLength, descriptionConstraints.maxLength)
  description: string;

  @ApiProperty({
    minLength: websiteUrlConstraints.minLength,
    maxLength: websiteUrlConstraints.maxLength,
    example: 'https://example.com',
    pattern: websiteUrlConstraints.match.toString(), // Преобразуем RegExp в строку
  })
  @IsStringWithTrim(websiteUrlConstraints.minLength, websiteUrlConstraints.maxLength)
  @Matches(websiteUrlConstraints.match)
  websiteUrl:	string;
}
