import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Pages
import { LoginComponent } from './main/login/login.component';


const routes: Routes = [
  { path: '', component: LoginComponent },

// Gated Section
// { path: 'gated', loadChildren: () => import('./main/gated/gated.module').then(m => m.GatedModule), canActivate: [AuthGuard]}
{ path: 'listing', loadChildren: () => import('./main/gated/gated.module').then(m => m.GatedModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
