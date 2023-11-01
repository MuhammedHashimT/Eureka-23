import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FeedsService } from './feeds.service';
import { Feed } from './entities/feed.entity';
import { CreateFeedInput } from './dto/create-feed.input';
import { UpdateFeedInput } from './dto/update-feed.input';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Feed)
export class FeedsResolver {
  constructor(private readonly feedsService: FeedsService,
    private readonly credentialsService: CredentialsService,) {}

  @Mutation(() => Feed)
  createFeed(@Args('createFeedInput') createFeedInput: CreateFeedInput) {
    return this.feedsService.create(createFeedInput);
  }

  @Query(() => [Feed], { name: 'feeds' })
  async findAll(@Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.feedsService.findAll();
  }

  @Query(() => Feed, { name: 'feed' })
  async findOne(@Args('id', { type: () => Int }) id: number, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.feedsService.findOne(id);
  }

  @Mutation(() => Feed)
  updateFeed(@Args('updateFeedInput') updateFeedInput: UpdateFeedInput) {
    return this.feedsService.update(updateFeedInput.id, updateFeedInput);
  }

  @Mutation(() => Feed)
  removeFeed(@Args('id', { type: () => Int }) id: number) {
    return this.feedsService.remove(id);
  }
}
