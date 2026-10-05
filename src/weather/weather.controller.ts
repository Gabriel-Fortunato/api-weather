import { Controller, Get, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { WeatherService } from './weather.service.js';
import { CreateWeatherDto } from './dto/create-weather.dto.js';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('forecast')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async getForecast(@Query() query: CreateWeatherDto, @Req() req: any) {
    // Na Vercel o IP real do cliente vem no cabeçalho x-forwarded-for
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket?.remoteAddress;
    return await this.weatherService.getWeatherForecast(query, clientIp);
  }
}