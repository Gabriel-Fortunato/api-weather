import { Controller, Get, Query } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { WeatherService } from './weather.service.js';
import { CreateWeatherDto } from './dto/create-weather.dto.js';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('forecast')
  async getForecast(
    @Query() query: CreateWeatherDto,
    @RealIP() ip: string,
  ) {
    return await this.weatherService.getWeatherForecast(query, ip);
  }
}