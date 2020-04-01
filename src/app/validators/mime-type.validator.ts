import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

// Check the MIME type of the file currently in the passed control
// Reference:
// https://stackoverflow.com/a/29672957/12900053
export const mimeType = (control: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof control.value === 'string') {
    return of(null);
  }

  const file = control.value as File;
  const fileReader = new FileReader();

  const frObs = new Observable((observer: Observer<{ [key: string]: any }>) => {
    fileReader.addEventListener('loadend', () => {
      // Filetype is in positions 0-4
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      let isValid = false;

      // Convert to hex
      for (const num of arr) {
        header += num.toString(16);
      }

      // Match accepted patterns
      // https://en.wikipedia.org/wiki/List_of_file_signatures
      switch (header) {
        case '89504e47': // PNG
          isValid = true;
          break;
        case 'ffd8ffe0': // JPEG
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;
        case '47494638': // GIF
          isValid = true;
          break;
        default:
          isValid = false; // Or you can use the blob.type as fallback
          break;
      }

      if (isValid) {
        // Angular takes a return value of
        // null to indicate valid data
        observer.next(null);
      } else {
        observer.next({
          invalidMimeType: true,
        });
      }

      observer.complete();
    });
    fileReader.readAsArrayBuffer(file);

  });

  return frObs;
};
