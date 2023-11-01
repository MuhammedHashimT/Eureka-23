import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TagService } from './tag.service';
import { Tag } from './entities/tag.entity';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Tag)
export class TagResolver {
  constructor(private readonly tagService: TagService,
    private readonly credentialsService: CredentialsService,) {}

  @Mutation(() => Tag)
  createTag(@Args('createTagInput') createTagInput: CreateTagInput) {
    return this.tagService.create(createTagInput);
  }

  @Query(() => [Tag], { name: 'tags' })
  async findAll(@Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.tagService.findAll();
  }

  @Query(() => Tag, { name: 'tag' })
  async findOne(@Args('id', { type: () => Int }) id: number, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.tagService.findOne(id);
  }

  @Mutation(() => Tag)
  updateTag(@Args('updateTagInput') updateTagInput: UpdateTagInput) {
    return this.tagService.update(updateTagInput.id, updateTagInput);
  }

  @Mutation(() => Tag)
  removeTag(@Args('id', { type: () => Int }) id: number) {
    return this.tagService.remove(id);
  }
}
