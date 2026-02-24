import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';
import { CreateContractDto } from '../dto/create-contract.dto';

@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Get()
  async findAll() {
    const data = await this.guestbookService.findAll();
    if (!data) throw new HttpException('Failed to fetch contracts', HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  @Post()
  async create(@Body() createContractDto: CreateContractDto) {
    const data = await this.guestbookService.create(createContractDto);
    if (!data) throw new HttpException('Failed to post contract', HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }
} // Added the missing closing bracket here