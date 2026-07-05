import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreatePostDto {
  @ApiProperty({ type: String, example: "Show HN: my new project" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ type: String, example: "https://example.com" })
  @IsUrl()
  url!: string;

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  authorId!: number;
}
