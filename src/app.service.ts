import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    
    return {
      message : "Server Successfully started"
    };
  }

  postHello() {
    return {
      message : "You Posted Successfully"
    };
  }
}
