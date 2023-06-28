export interface SchemaDto {
  tables: TableInfoDto[];
  columns: SchemaInfoDto[];
}

export interface SchemaInfoDto {
  resourceId: string;
  pidURI: string;
  label: string;
}

export interface TableInfoDto extends SchemaInfoDto {
  linkedTableFiled: SchemaInfoDto[];
}
