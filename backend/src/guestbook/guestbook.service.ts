import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateContractDto } from '../dto/create-contract.dto';

@Injectable()
export class GuestbookService {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
  );

  async findAll() {
    const { data, error } = await this.supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase GET error:', error.message);
      return null;
    }
    return data;
  }

  async create(dto: CreateContractDto) {
    const { data, error } = await this.supabase
      .from('guestbook')
      .insert([dto])
      .select();

    if (error) {
      console.error('Supabase POST error:', error.message);
      return null;
    }
    return data;
  }
}