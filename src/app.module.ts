import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CandidatesModule } from './candidates/candidates.module';
import { ProgrammesModule } from './programmes/programmes.module';
import { SectionsModule } from './sections/sections.module';
import { GradesModule } from './grades/grades.module';
import { TeamsModule } from './teams/teams.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { SkillModule } from './skill/skill.module';
import { PositionModule } from './position/position.module';
import { CandidateProgrammeModule } from './candidate-programme/candidate-programme.module';
import { DetailsModule } from './details/details.module';
import { CategorySettingsModule } from './category-settings/category-settings.module';
import { CredentialsModule } from './credentials/credentials.module';
import { CustomContextProvider } from './utils/custom';
import { JudgeModule } from './judge/judge.module';
import { SubstituteModule } from './substitute/substitute.module';
import { FeedsModule } from './feeds/feeds.module';
import { CustomSettingsModule } from './custom-settings/custom-settings.module';
import { GalleryModule } from './gallery/gallery.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [
    // env configuration

    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    // config of JWT

    // PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule.registerAsync({
    //   useFactory: async () => ({
    //     secret: process.env.JWT_SECRET,
    //     signOptions: { expiresIn: '1d' },
    //   }),
    // }),
  


    // connecting to mysql planetscale server

    TypeOrmModule.forRootAsync(
      // dataSourceOptions 
      {
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: ['dist/**/entities/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        // synchronize: true,
        ssl: { "rejectUnauthorized": true },
        // migrationsTableName: 'migrations',
        // migrations: ['dist/src/database/migrations/*.js'],
        // configService.get<string>('MYSQL_ATTR_SSL_CA') ,
        // cli: {
        //   migrationsDir: 'src/database/migrations',
        // },
        // namingStrategy: new SnakeNamingStrategy(),
        // url:configService.get<string>('DATABASE_URL'),
      }),

      inject: [ConfigService],
    }
    ),
    
    

    // graphql configuration

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: '/tmp/schema.gql',
      context: ({ req , res }) => ({ req, res }),
      playground:{
        settings: {
          'request.credentials': 'include',
        },
      },
      cache: 'bounded',
      introspection:true ,
    cors: {
        origin: true,
        credentials: true,

      },
    }),

    CandidatesModule,
    ProgrammesModule,
    SectionsModule,
    GradesModule,
    TeamsModule,
    DetailsModule,
    CategoryModule,
    SkillModule,
    PositionModule,
    CandidateProgrammeModule,
    CategorySettingsModule,
    CredentialsModule,
    JudgeModule,
    SubstituteModule,
    FeedsModule,
    CustomSettingsModule,
    GalleryModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService , CustomContextProvider],
})
export class AppModule {
 }
