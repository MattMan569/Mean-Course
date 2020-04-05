import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(catchError((error: HttpErrorResponse) => {
      let message = 'An unknown error occurred';

      if (error.error) {
        if (error.error instanceof ProgressEvent) {
          message = 'The server is not resonding, please try again later';
        } else {
          message = error.error;
        }
      }

      this.dialog.open(ErrorComponent, { data: { message } });

      return throwError(error);
    }));
  }
}
