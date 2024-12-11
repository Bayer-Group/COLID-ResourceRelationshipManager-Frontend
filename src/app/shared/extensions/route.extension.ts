import { ActivatedRouteSnapshot } from '@angular/router';

export class RouteExtension {
  public static SetRouteInStorage(route: ActivatedRouteSnapshot) {
    window.sessionStorage.removeItem('url');
    window.sessionStorage.removeItem('queryParams');

    const urlSegments = new Array<string>();
    this.getUrlSegment(urlSegments, route);

    if (urlSegments.length !== 0) {
      window.sessionStorage.setItem('url', JSON.stringify(urlSegments));
    }

    if (route.queryParams != null) {
      window.sessionStorage.setItem(
        'queryParams',
        JSON.stringify(route.queryParams)
      );
    }
  }

  private static getUrlSegment(array: string[], route: ActivatedRouteSnapshot) {
    array.push(...route.url.map((url) => url.path));

    route.children.forEach((child) => this.getUrlSegment(array, child));
  }
}
