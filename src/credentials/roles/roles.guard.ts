import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.enum';
import { CredentialsService } from '../credentials.service';
import { LoginService } from '../login/login.service';
import { JwtPayload } from '../jwt/jwt.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly CredentialService: CredentialsService,
    private readonly loginService: LoginService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]); 

    if (!requiredRoles) {
      return true; // No roles specified, allow access
    }

    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    // get the cookie
    const cookie = req.cookies['__user'];

    // if the cookie is not set, return false
    if (!cookie) {
      return false;
    }

    // if the cookie is set, verify the token
    const token: JwtPayload = await this.loginService.validateJwtToken(cookie);

    // if the token is not valid, return false
    if (!token) {
      this.hasRoleTOJudge(context);
    }

    // Assign roles based on the username
    const username = token.username; // Assuming the username is sent in the request headers

    if (!username) {
      return false;
    }

    // find the user in the database
    const user = await this.CredentialService.findOneByUsername(username);

    if (!user) {
      return false;
    }

    // Assign the user to the request object
    req.user = user;

    // Check if the user has access to the requested role
    return requiredRoles.some(role => req.user?.roles === role);
  }

  // This method is used by the AuthGuard to check if the user has access to Judge role

  async hasRoleTOJudge(context: ExecutionContext) {}
}

// The HasRoles decorator is used to assign roles to a resolver
export const HasRoles = (...roles: Roles[]) => SetMetadata('roles', roles);
