import {
  IncomingMessage,
  ServerResponse,
} from 'http';
import {
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { NextService } from '@nestpress/next';
import { ApiTags } from '@nestjs/swagger';
import { Page, NextController } from '../page.decorator';

@NextController()
@ApiTags('pages')
export class HomeController {
  constructor(private readonly next: NextService) {}

  @Page(Get(), '/')
  public async home(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    await this.next.render('/', req, res);
  }
}