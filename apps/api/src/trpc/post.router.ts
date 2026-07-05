import { Injectable } from "@nestjs/common";
import { CreatePostSchema, PostSchema, UpdatePostSchema } from "@repo/types";
import { Input, Mutation, Query, Router } from "nestjs-trpc";
import { z } from "zod";
import { PostService } from "../post/post.service.js";

const idInput = z.object({ id: z.number().int() });
const updateInput = z.object({ id: z.number().int(), data: UpdatePostSchema });

@Router({ alias: "post" })
@Injectable()
export class PostRouter {
  constructor(private readonly postService: PostService) {}

  @Query({ output: z.array(PostSchema) })
  findAll() {
    return this.postService.findAll();
  }

  @Query({ input: idInput, output: PostSchema.nullable() })
  findById(@Input() input: z.infer<typeof idInput>) {
    return this.postService.findOne(input.id);
  }

  @Mutation({ input: CreatePostSchema, output: PostSchema })
  create(@Input() input: z.infer<typeof CreatePostSchema>) {
    return this.postService.create(input);
  }

  @Mutation({ input: updateInput, output: PostSchema })
  update(@Input() input: z.infer<typeof updateInput>) {
    return this.postService.update(input.id, input.data);
  }

  @Mutation({ input: idInput, output: PostSchema })
  delete(@Input() input: z.infer<typeof idInput>) {
    return this.postService.remove(input.id);
  }
}
