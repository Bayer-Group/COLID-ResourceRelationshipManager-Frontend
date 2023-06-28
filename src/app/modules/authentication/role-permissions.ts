import { Constants } from '../../shared/constants';

export class RolePermissions {
  static SuperAdmin = new Array<string>(
    Constants.Authentication.Roles.SuperAdministration
  );
  static Admin = new Array<string>(
    Constants.Authentication.Roles.Administration,
    Constants.Authentication.Roles.SuperAdministration
  );
}
