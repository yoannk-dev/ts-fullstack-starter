import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateTodoDto } from "./create-todo.dto.js";

export class UpdateTodoDto extends PartialType(OmitType(CreateTodoDto, ["authorId"] as const)) {}
