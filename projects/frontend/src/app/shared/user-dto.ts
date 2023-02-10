import { SearchFilterDataMarketplaceDto } from './search-filter-data-marketplace-dto';
import { MessageConfigDto } from './../state/message-config-dto';
import { DefaultConsumerGroupDto } from './default-consumer-group-dto';
import { SearchFilterEditor } from './../shared/search-filter-editor';

export class UserDto {
  id: string;
  emailAddress: string;
  defaultConsumerGroup: DefaultConsumerGroupDto;
  searchFilterEditor: SearchFilterEditor;
  messageConfig: MessageConfigDto;
  defaultSearchFilterDataMarketplace: number;
  searchFiltersDataMarketplace: SearchFilterDataMarketplaceDto[];

  public constructor(id: string, emailAddress: string) {
    this.id = id;
    this.emailAddress = emailAddress;
  }
}
