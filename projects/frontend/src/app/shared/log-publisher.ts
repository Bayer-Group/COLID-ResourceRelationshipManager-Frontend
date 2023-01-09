import { Observable } from 'rxjs';
import { EdmLogEntry } from 'projects/frontend/src/app/shared/edm-log-entry';
import { LogLevel } from 'projects/frontend/src/app/shared/log-level';

export interface LogPublisher {
    log(logLevel: LogLevel, record: EdmLogEntry): Observable<boolean>;
    clear(): Observable<boolean>;
}
