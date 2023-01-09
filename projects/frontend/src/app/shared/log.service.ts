import { Injectable } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { LogPublishersService } from './log-publishers.service';
import { LogPublisher } from 'projects/frontend/src/app/shared/log-publisher';
import { LogLevel } from 'projects/frontend/src/app/shared/log-level';
import { EdmLogEntry } from 'projects/frontend/src/app/shared/edm-log-entry';
import { LogType } from 'projects/frontend/src/app/shared//log-type';

@Injectable({
    providedIn: 'root'
})
export class LogService {

    publishers: LogPublisher[];

    constructor(private publishersService: LogPublishersService) {
        this.publishers = this.publishersService.publishers;
    }

    public log(msg: string, optionalDetails?: object) {
        this.writeLogEntry(msg, LogLevel.Verbose, optionalDetails);
    }

    public debug(msg: string, optionalDetails?: object) {
        this.writeLogEntry(msg, LogLevel.Debug, optionalDetails);
    }

    public info(msg: string, optionalDetails?: object) {
        this.writeLogEntry(msg, LogLevel.Info, optionalDetails);
    }

    public warn(msg: string, optionalDetails?: object) {
        this.writeLogEntry(msg, LogLevel.Warn, optionalDetails);
    }

    public error(msg: string, optionalDetails?: object) {
        this.writeLogEntry(msg, LogLevel.Error, optionalDetails);
    }

    public fatal(msg: string, optionalDetails?: object) {
        this.writeLogEntry(msg, LogLevel.Fatal, optionalDetails);
    }

    private writeLogEntry(msg: string, logLevel: LogLevel, optionalDetails?: object) {
        const logEntry = this.createLogEntry(msg, LogType.General, optionalDetails);
        this.publishLogEntry(logLevel, logEntry);
    }

    private publishLogEntry(logLevel: LogLevel, logEntry: EdmLogEntry) {
        for (const logger of this.publishers) {
            logger.log(logLevel, logEntry).subscribe();
        }
    }

    private createLogEntry(msg: string, logType: LogType, additionalInfo?: object): EdmLogEntry {
        const logEntry: EdmLogEntry = {
            timestamp: new Date(),
            message: msg,
            logType: logType,
            product: environment.adalConfig.clientId,
            layer: 'angular_client',
            location: window.location.toString(),
            hostname: '',
            userId: '',
            elapsedMilliseconds: null,
            additionalInfo: {}
        };

        logEntry.additionalInfo = {};
        if (additionalInfo != null) {
            for (const key in additionalInfo) {
                let value = additionalInfo[key];
                if (!(value instanceof Function)) {
                    logEntry.additionalInfo[key] = value;
                }
            }
        }

        logEntry.additionalInfo['user-agent'] = window.navigator.userAgent;

        return logEntry;
    }
}
