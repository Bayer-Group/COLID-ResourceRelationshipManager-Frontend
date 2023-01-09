[
    {
        "graphMapId": "08d9872d-9399-474d-82ab-337bd33f1d83",
        "name": "Test 3",
        "id": "",
        "description": "Description 3",
        "nodeCount": "3",
        "modifiedBy": "ganesh.ghadge.ext@bayer.com",
        "modifiedAt": "2021-10-04T11:53:26.921876"
    },
    {
        "graphMapId": "08d9872c-86d9-4f99-892c-8e94f40e08a3",
        "name": "Test 2",
        "description": "Description 2",
        "nodeCount": "2",
        "modifiedBy": "ganesh.ghadge.ext@bayer.com",
        "modifiedAt": "2021-10-04T11:45:56.037608"
    },
    {
        "graphMapId": "08d9872a-c1c4-481b-8e92-ec2a77671530",
        "name": "Test 1",
        "description": "Description 1",
        "nodeCount": "1",
        "modifiedBy": "ganesh.ghadge.ext@bayer.com",
        "modifiedAt": "2021-10-04T11:33:15.888771"
    }
]

export class GraphMapInfo {
    constructor() { }

    name: string = "";
    description: string = "";
    nodeCount: number = 0;
    id: string = "";
    modifiedBy: string = "";
    modifiedAt: string = "";
}