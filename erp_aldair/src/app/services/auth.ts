import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  role: 'admin' | 'common' | 'superAdmin' = 'common';

  commonUser = [
    'group:view',
    'ticket:view',
    'ticket:edit_state',
    'user:view',
    'user:edit'
  ];

  adminUser = [
    'group:view', 'group:edit', 'group:add', 'group:delete',
    'ticket:view', 'ticket:edit', 'ticket:add', 'ticket:delete', 'ticket:edit_state',
    'user:view', 'users:view', 'user:edit', 'user:add', 'user:delete'
  ];

  hasPermission(permission: string): boolean {
    const perms = this.role === 'common' ? this.commonUser : this.adminUser;
    return perms.includes(permission);
  }

  toggleRole() {
    if (this.role === 'common') {
      this.role = 'admin';
    } else if (this.role === 'admin') {
      this.role = 'superAdmin';
    } else {
      this.role = 'common';
    }
  }
}
