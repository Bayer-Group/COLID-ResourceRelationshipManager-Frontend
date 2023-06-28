import { ColidEntrySubscriptionDto } from './colid-entry-subscription-dto';
import { DefaultConsumerGroupDto } from './default-consumer-group-dto';

export class UserDto {
  id: string;
  emailAddress: string;
  defaultConsumerGroup: DefaultConsumerGroupDto;
  colidEntrySubscriptions: ColidEntrySubscriptionDto[];

  public constructor(id: string, emailAddress: string) {
    this.id = id;
    this.emailAddress = emailAddress;
  }
}
