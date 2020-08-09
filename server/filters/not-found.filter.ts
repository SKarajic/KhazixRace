import { ArgumentsHost, Catch, ExceptionFilter, HttpException, NotFoundException } from '@nestjs/common';
import { NextService } from '@nestpress/next';


@Catch(NotFoundException)
export class NotFoundFilter implements ExceptionFilter {
  constructor(private readonly next: NextService) {}


  catch(e: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    res.status(e.getStatus());

    const contentType = (ctx.getRequest().headers['content-type'] || '').toLowerCase();
    if (contentType === 'application/json') {
      res.json({
        statusCode: e.getStatus(),
        message: e.message,
        error: 'Not Found',
      })
      return
    } 

    this.next.render('/_error', req, res);
  }
}
