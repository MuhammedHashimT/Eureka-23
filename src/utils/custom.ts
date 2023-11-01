import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CustomContextProvider {
  create(context: ExecutionContext): any {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    // You can also modify the context object or add additional properties here if needed.

    return { req };
  }
}
