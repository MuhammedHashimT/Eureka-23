import { Module, ValidationPipe, forwardRef } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsResolver } from './credentials.resolver';
import { Credential } from './entities/credential.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsModule } from 'src/teams/teams.module';
import { CategoryModule } from 'src/category/category.module';
import { RolesGuard } from './roles/roles.guard';
import { LoginService } from './login/login.service';
import { LoginResolver } from './login/login.resolver';
import { LocalStrategy } from './login/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthPipe } from './pipe/auth.pipe';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential]),
    forwardRef(() => TeamsModule),
    CategoryModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  providers: [
    CredentialsResolver,
    CredentialsService,
    RolesGuard,
    LoginService,
    LoginResolver,
    LocalStrategy,
    AuthPipe,
   ValidationPipe

  ],
  exports: [CredentialsService, RolesGuard, AuthPipe , LoginService],
})
export class CredentialsModule {}
