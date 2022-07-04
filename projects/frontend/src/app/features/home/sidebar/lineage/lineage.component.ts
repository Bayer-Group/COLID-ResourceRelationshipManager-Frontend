import { Component } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

interface TableNode {
  name: string;
  checked?: boolean;
  children?: TableNode[];
}

const TREE_DATA: TableNode[] = [
  {
    name: 'Tablename - 01',
    children: [
      { name: 'Firstname' },
      { name: 'Lastname' },
      { name: 'CompanyID' },
      { name: 'CompanyName' },
      { name: 'Address' },
      { name: 'Postcode' },
      { name: 'City' }
    ]
  },
  {
    name: 'Tablename - 02',
    children: [
      { name: 'AnotherColumn' },
      { name: 'Column-03' },
      { name: 'FurtherColumns' },
      { name: 'Column-03' },
      { name: 'FurtherColumns' },
      { name: 'Column-03' },
      { name: 'FurtherColumns' },
      { name: 'Column-03' },
      { name: 'FurtherColumns' }
    ]
  }
];

@Component({
  selector: 'colid-lineage',
  templateUrl: './lineage.component.html',
  styleUrls: ['./lineage.component.scss']
})
export class LineageComponent {
  treeControl = new NestedTreeControl<TableNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<TableNode>();

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: TableNode): boolean =>
    !!node.children && node.children.length > 0;
}
