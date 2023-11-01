import { Resolver, Query, Mutation, Args, Int, Info } from '@nestjs/graphql';
import { CustomSettingsService } from './custom-settings.service';
import { CustomSetting } from './entities/custom-setting.entity';
import { CreateCustomSettingInput } from './dto/create-custom-setting.input';
import { fieldsProjection } from 'graphql-fields-list';
import { UpdateCustomSettingInput } from './dto/update-custom-setting.input';
import { CredentialsService } from 'src/credentials/credentials.service';

@Resolver(() => CustomSetting)
export class CustomSettingsResolver {
  constructor(private readonly customSettingsService: CustomSettingsService,
    private readonly credentialsService: CredentialsService,) {}

  @Mutation(() => CustomSetting)
  createCustomSetting(@Args('createCustomSettingInput') createCustomSettingInput: CreateCustomSettingInput) {
    return this.customSettingsService.create(createCustomSettingInput);
  }

  @Query(() => [CustomSetting], { name: 'customSettings' })
  async findAll(
  @Info() info: any, 
  @Args('api_key') api_key: string,
  ) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.customSettingsService.findAll( fields);
  }

  @Query(() => CustomSetting, { name: 'customSetting' })
  async findOne(@Args('id', { type: () => Int }) id: number , @Args('api_key') api_key: string, @Info() info: any) {
    await this.credentialsService.ValidateApiKey(api_key);
    const fields = Object.keys(fieldsProjection(info));
    return this.customSettingsService.findOne(id , fields);
  }

  @Mutation(() => CustomSetting)
  updateCustomSetting(@Args('updateCustomSettingInput') updateCustomSettingInput: UpdateCustomSettingInput) {
    return this.customSettingsService.update(updateCustomSettingInput.id, updateCustomSettingInput);
  }

  @Mutation(() => CustomSetting)
  removeCustomSetting(@Args('id', { type: () => Int }) id: number) {
    return this.customSettingsService.remove(id);
  }
}
