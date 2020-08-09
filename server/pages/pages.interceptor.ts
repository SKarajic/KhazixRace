import { Injectable, NestInterceptor, ExecutionContext, CallHandler, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PagesController } from './pages.controller';

@Injectable()
export class PagesInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    if (!Reflect.getMetadataKeys(ctx.getClass()).includes('next/controller')) {
      return next.handle();
    }

    const handler = ctx.getHandler();
    const controller = ctx.getClass();

    const keys = Reflect.getMetadataKeys(handler);
    const [decorator] = keys.filter(key => key === 'next/page');
    if (!decorator) {
      throw new InternalServerErrorException(
        `method '${handler.name}' in controller '${controller.name}' misses a @Page decorator`
      );
    }
    let page: string = Reflect.getMetadata(decorator, handler).replace(new RegExp('\/index$'), '');
    page = page.startsWith('/') ? page : `/${page}`;

    const httpContext = ctx.switchToHttp();
    const req = httpContext.getRequest();
    const res = httpContext.getResponse();

    const i = req.rawHeaders.findIndex((header: string) => header.toLowerCase() === 'x-verify-page');
    if (i === -1) {
      return next.handle();
    }
    let reqPage = req.rawHeaders[i + 1].replace(new RegExp('\/index$'), '');
    reqPage = reqPage.startsWith('/') ? reqPage : `/${reqPage}`;

    if (reqPage !== page) {
      throw new NotFoundException('page not found');
    }
    return res.sendStatus(200);
  }
}