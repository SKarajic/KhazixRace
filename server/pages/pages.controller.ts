import { Controller, All, Res, NotFoundException, Req, HttpCode } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ServerResponse, IncomingMessage } from 'http';
import { NextService } from '@nestpress/next';

@Controller()
export class PagesController {
  constructor(private readonly next: NextService) {}

  // @All('*')
  // @HttpCode(404)
  // @ApiExcludeEndpoint()
  // public async home(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
  //   await this.next.render('/_error', req, res);
  // }
}
