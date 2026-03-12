import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { UserComponent } from './components/user/user';
import { GroupComponent } from './components/group/group';
import { LandingComponent } from './components/landing/landing';
import { VistaGrupoComponent } from './components/vista-grupo/vista-grupo';
import { GestionUsuariosComponent } from './components/gestion-usuarios/gestion-usuarios';

export const routes: Routes = [
  { path: 'home', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'user', component: UserComponent },
  { path: 'gestion-usuarios', component: GestionUsuariosComponent },
  { path: 'group', component: GroupComponent },
  { path: 'vista-grupo', component: VistaGrupoComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
