import { ApplicationConfig, provideBrowserGlobalErrorListeners, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export class CustomErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const message = error?.message || error?.toString() || '';
        if (message.includes("reading 'startTime'")) {
      return;
    }

    console.error(error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
