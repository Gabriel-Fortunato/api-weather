import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateWeatherDto } from './dto/create-weather.dto.js';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly weatherUrl = 'https://api.open-meteo.com/v1/forecast';
  private readonly geoIpUrl = 'http://ip-api.com/json';

  constructor(private readonly httpService: HttpService) {}

  async getWeatherForecast(query: CreateWeatherDto, clientIp?: string) {
    let lat = query.latitude;
    let lon = query.longitude;
    let locationName = 'Localização Atual';

    // 📍 Se não mandou lat/lon, detecta automaticamente via IP
    if (!lat || !lon) {
      try {
        // Trata requisições locais (127.0.0.1 ou ::1) no ambiente dev
        const targetIp = (clientIp && !clientIp.includes('127.0.0.1') && !clientIp.includes('::1')) 
          ? clientIp 
          : ''; // IP vazio no ip-api.com usa o IP público atual do computador

        const geoResponse = await firstValueFrom(
          this.httpService.get(`${this.geoIpUrl}/${targetIp}`),
        );

        if (geoResponse.data && geoResponse.data.status === 'success') {
          lat = geoResponse.data.lat;
          lon = geoResponse.data.lon;
          locationName = `${geoResponse.data.city}, ${geoResponse.data.regionName} - ${geoResponse.data.country}`;
        } else {
          throw new Error('Falha na geolocalização por IP');
        }
      } catch (err) {
        this.logger.warn('Não foi possível obter a localização por IP, usando padrão.');
        // Fallback para uma coordenada padrão (Ex: Vitória da Conquista - BA)
        lat = -14.86;
        lon = -40.84;
        locationName = 'Vitória da Conquista, BA (Fallback)';
      }
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.weatherUrl, {
          params: {
            latitude: lat,
            longitude: lon,
            timezone: query.timezone || 'auto',
            hourly: 'temperature_2m,precipitation,wind_speed_10m',
            current: 'temperature_2m,precipitation,wind_speed_10m',
            forecast_days: 3,
          },
        }),
      );

      return {
        detectedLocation: locationName,
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          elevation: data.elevation,
        },
        current: data.current,
        hourlyForecast: data.hourly,
      };
    } catch (error: any) {
      throw new HttpException(
        'Erro ao conectar com o provedor de dados meteorológicos',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}