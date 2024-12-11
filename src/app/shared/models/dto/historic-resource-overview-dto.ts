import { Constants } from '../../constants';

export class ResourceRevisionHistory {
  name: string;
  additionals: object;
  removals: object;
}

export class HistoricResourceOverviewDTO {
  id: string;
  pidUri: string;
  lastChangeDateTime: string;
  lastChangeUser: string;
  lifeCycleStatus: string = Constants.Resource.LifeCycleStatus.Historic;
}
