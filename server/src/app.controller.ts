import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('random')
  getRandomMessage() : string {
    const messages = [
      "Hello from the backend!",
      "This is a random message.",
      "NestJS is awesome!",
      "Have a great day!",
      "You clicked the button!"
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }
}
