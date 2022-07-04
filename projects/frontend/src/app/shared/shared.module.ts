import { NgModule } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ColidIconsModule } from './icons/colid-icons.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list'
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UrlSafePipe } from './pipes/urlsafe.pipe';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [],
  imports: [
    // Angular Components and access to <router>
    CommonModule,
    RouterModule,
    ColidIconsModule,
    // Material Design
    MatIconModule,
    MatMenuModule,
    MatRadioModule,
    MatTreeModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
    FormsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  providers: [],
  exports: [
    // Angular Components and access to <router>
    CommonModule,
    RouterModule,
    ColidIconsModule,
    // Material Design
    MatIconModule,
    MatMenuModule,
    MatRadioModule,
    MatTreeModule,
    MatTableModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSidenavModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
    FormsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ]
})
export class SharedModule { }
