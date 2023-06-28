import { LinkTypeContainer, LinkTypesDto } from './link-types-dto';

export interface LinkEditHistory extends LinkTypeContainer {
  action: LinkHistoryAction;
}

export interface LinkEditHistoryDto extends LinkTypesDto {
  action: LinkHistoryAction;
}

export enum LinkHistoryAction {
  Delete = 'remove',
  Add = 'add',
}
