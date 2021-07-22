import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

// Sub Pages
import { ListingComponent } from './listing/listing.component';
import { AddnewComponent } from './addnew/addnew.component';
import { SettingsComponent } from './settings/settings.component';
import { PasswordGenComponent } from '../shared-components/password-gen/password-gen.component';

// Used by Sub Pages.
import { ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { EditComponent } from './edit/edit.component';

// Routes
const GATED_ROUTES: Routes = [
  { path: '', component: ListingComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'add_new', component: AddnewComponent },
  { path: 'edit/:id', component: EditComponent }
]; // GATED_ROUTES

@NgModule({
  declarations: [
    ListingComponent,
    SettingsComponent,
    AddnewComponent,
    SettingsComponent,
    EditComponent,
    PasswordGenComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(GATED_ROUTES)
  ],
  exports: [
    RouterModule
  ]
})
export class GatedModule { }
