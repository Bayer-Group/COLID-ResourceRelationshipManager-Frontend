export class GraphMapV2SaveDto {
    id: string = "";
    name: string = "";
    description: string = "";
    nodes: NodeV2SaveDto[] = [];
}
export class NodeV2SaveDto {
    id: string = "";
    fx: number = 0;
    fy: number = 0;
}