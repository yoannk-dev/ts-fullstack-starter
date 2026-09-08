import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ApiKeyGuard } from "../common/guards/api-key.guard.js";
import { Status } from "../../prisma/generated/enums.js";
import { CreateTodoDto } from "./dto/create-todo.dto.js";
import { UpdateTodoDto } from "./dto/update-todo.dto.js";
import { DEFAULT_TAKE, MAX_TAKE, TodoService } from "./todo.service.js";

@ApiTags("todos")
@Controller("todos")
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOperation({ summary: "List all todos" })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "status", required: false, enum: Status })
  @ApiQuery({ name: "take", required: false, type: Number, description: `Default ${String(DEFAULT_TAKE)}, max ${String(MAX_TAKE)}` })
  @ApiQuery({ name: "skip", required: false, type: Number })
  @ApiResponse({ status: 200, description: "The list of todos, most recent first." })
  findAll(
    @Query("search") search?: string,
    @Query("status") status?: Status,
    @Query("take", new ParseIntPipe({ optional: true })) take?: number,
    @Query("skip", new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.todoService.findAll({ search, status, take, skip });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single todo by id" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "The todo." })
  @ApiResponse({ status: 404, description: "Todo not found." })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.todoService.findOne(id);
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Create a todo" })
  @ApiBody({ type: CreateTodoDto })
  @ApiResponse({ status: 201, description: "The created todo." })
  @ApiResponse({ status: 401, description: "Missing or invalid API key." })
  create(@Body() dto: CreateTodoDto) {
    return this.todoService.create(dto);
  }

  @Patch(":id")
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Update a todo" })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({ type: UpdateTodoDto })
  @ApiResponse({ status: 200, description: "The updated todo." })
  @ApiResponse({ status: 401, description: "Missing or invalid API key." })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateTodoDto) {
    return this.todoService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Delete a todo" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "The deleted todo." })
  @ApiResponse({ status: 401, description: "Missing or invalid API key." })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.todoService.remove(id);
  }
}
