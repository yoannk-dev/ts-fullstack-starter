import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Priority, Status } from "../../../prisma/generated/enums.js";

export class CreateTodoDto {
  @ApiProperty({ type: String, example: "Write the quarterly report" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ type: String, example: "Include Q3 revenue breakdown", nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ enum: Status, example: Status.TODO })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({ enum: Priority, example: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ type: Date, example: "2026-08-01T00:00:00.000Z" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  /**
   * Trusted at face value: there's no auth/session in this starter, so
   * nothing verifies the caller actually is this author. Known limitation,
   * not an oversight — see apps/api/README.md#known-limitations.
   */
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  authorId!: number;
}
