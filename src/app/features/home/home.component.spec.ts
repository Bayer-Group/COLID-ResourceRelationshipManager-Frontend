import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  @Component({
    selector: 'colid-footbar',
    template: ''
  })
  class MockFootbarComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent, MockFootbarComponent],
      imports: [RouterModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
