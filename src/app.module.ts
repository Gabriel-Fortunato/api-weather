import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module.js';

@Module({
  imports: [
    WeatherModule,
  ],
})
export class AppModule {}