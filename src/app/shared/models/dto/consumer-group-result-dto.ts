export class ConsumerGroupResultDto {
  id: string;
  name: string;
  lifecycleStatus: string;
  properties: { [id: string]: any[] };
}
