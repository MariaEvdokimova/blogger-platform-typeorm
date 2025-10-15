import { ApiProperty } from "@nestjs/swagger";
import { contentConstraints } from "../../domain/entities/comment.entity";
import { IsStringWithTrim } from "../../../../../core/decorators/validation/is-string-with-trim";

export class UpdateCommentInputDto {
  @ApiProperty({
    minLength: contentConstraints.minLength,
    maxLength: contentConstraints.maxLength,
    example: 'stringstringstringst',
  })
  @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;
}
