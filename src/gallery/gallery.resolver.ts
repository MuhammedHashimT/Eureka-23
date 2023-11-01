import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Gallery } from './entities/gallery.entity';
import { GalleryService } from './gallery.service';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => Gallery)
export class GalleryResolver {
  constructor(private readonly galleryService: GalleryService,
    private readonly credentialsService: CredentialsService,
    ) {}

  @Query(() => [Gallery], { name: 'galleries' })
  async findAll(@Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.galleryService.findAll();
  }

  @Query(() => Gallery, { name: 'gallery' })
  async findOne(@Args('id', { type: () => Int }) id: number, @Args('api_key') api_key: string,) {
    await this.credentialsService.ValidateApiKey(api_key);
    return this.galleryService.findOne(id);
  }

  @Mutation(() => Gallery)
  removeGallery(@Args('id') id: number) {
    return this.galleryService.remove(id);
  }
}
