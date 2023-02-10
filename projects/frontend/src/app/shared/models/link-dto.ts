export interface LinkDto {
  display: boolean;
  isRendered: boolean;
  isVersionLink: boolean;
  linkType: {
    key: string;
    value: string;
  };
  outbound: boolean;
  source: string;
  sourceName: string;
  sourceType: string;
  target: string;
  targetName: string;
  targetType: string;
}
