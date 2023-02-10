export default class Resource extends Node {
  id: string = '';
  name: string = '';
  status: boolean = false;
  links: string[] = [];
  linkCount: number = this.links.length;
}
