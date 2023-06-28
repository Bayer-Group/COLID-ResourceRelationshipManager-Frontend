import { ResourceOverviewDTO } from './dto/resource-overview-dto';

export class ResourceOverviewCTO {
  total: number;
  items: Array<ResourceOverviewDTO>;
}
