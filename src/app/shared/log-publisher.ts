import { Observable } from 'rxjs';
import { EdmLogEntry } from 'src/app/shared/models/edm-log-entry';
import { LogLevel } from 'src/app/shared/log-level';

export interface LogPublisher {
  log(logLevel: LogLevel, record: EdmLogEntry): Observable<boolean>;
  clear(): Observable<boolean>;
}
