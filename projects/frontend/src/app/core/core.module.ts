import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { RouterModule } from '@angular/router';
import { NavbarModule } from './layout/navbar/navbar.module';
import { SharedModule } from '../shared/shared.module';
import { SupportFeedbackBarComponent } from '../features/home/support-feedback-bar/support-feedback-bar.component';

@NgModule({
  declarations: [MainLayoutComponent, SupportFeedbackBarComponent],
  imports: [
    CommonModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    NavbarModule
  ],
  exports: [MainLayoutComponent]
})
export class CoreModule { }
