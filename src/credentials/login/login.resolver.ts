import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { CredentialsService } from '../credentials.service';
import { LoginService } from './login.service';
import { HttpException, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { LoginGuard } from './login.guard';
import { Credential } from '../entities/credential.entity';
import { Response } from 'express';
import { LoginType } from '../dto/login.type';

@Resolver(() => Credential)
export class LoginResolver {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly loginService: LoginService,
  ) {}

  @Mutation(() => LoginType, { name: 'login' })
  @UseGuards(LoginGuard)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context("res") context: Response,
  ) {
    try {
      const val = await this.loginService.login(username, password);
      if (!val) {
        throw new Error('Invalid Username or Password');
      }
      console.log(val);
      
      if (val.token) {
        context.cookie('__user', val.token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
            sameSite: 'none',
            secure: true,
        });
  
        return val;

      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED);
    }
  }
  
  @Query(() => String)
  getCookieValue(@Context('req') req: any): string {
    const cookieValue = req.cookies['__user'];
    return cookieValue;
  }

  // logout
  @Mutation(() => Boolean)
  async logout(@Context() context: any) {
    context.res.clearCookie('__user', { httpOnly: true, secure: true , sameSite : 'none'});
    return true;
  }
}
