import { Injectable } from '@angular/core';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private auth: AuthService) {}

  hasPermission(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  refreshPermissionsForGroup(groupId: string): void {
    this.auth.setPermisosGrupo(groupId);
  }
}
