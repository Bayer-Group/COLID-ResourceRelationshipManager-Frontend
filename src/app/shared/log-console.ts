import { Observable, of as observableOf } from 'rxjs';
import { LogPublisher } from './log-publisher';
import { EdmLogEntry } from './models/edm-log-entry';
import { LogLevel } from './log-level';

export class LogConsole implements LogPublisher {
  log(_logLevel: LogLevel, _entry: EdmLogEntry): Observable<boolean> {
    return observableOf(true);
  }

  clear(): Observable<boolean> {
    console.clear();
    return observableOf(true);
  }
}
