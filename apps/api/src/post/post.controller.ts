import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ApiKeyGuard } from "../common/guards/api-key.guard.js";
import { CreatePostDto } from "./dto/create-post.dto.js";
import { UpdatePostDto } from "./dto/update-post.dto.js";
import { PostService } from "./post.service.js";

@ApiTags("posts")
@Controller("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: "List all posts" })
  @ApiResponse({ status: 200, description: "The list of posts, most recent first." })
  findAll() {
    return this.postService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single post by id" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "The post." })
  @ApiResponse({ status: 404, description: "Post not found." })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Create a post" })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: "The created post." })
  @ApiResponse({ status: 401, description: "Missing or invalid API key." })
  create(@Body() dto: CreatePostDto) {
    return this.postService.create(dto);
  }

  @Patch(":id")
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Update a post" })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: "The updated post." })
  @ApiResponse({ status: 401, description: "Missing or invalid API key." })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.postService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Delete a post" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "The deleted post." })
  @ApiResponse({ status: 401, description: "Missing or invalid API key." })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }
}
