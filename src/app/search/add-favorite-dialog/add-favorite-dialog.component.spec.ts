import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddFavoriteDialogComponent } from './add-favorite-dialog.component';
import { FavoritesService } from 'src/app/shared/services/favorites.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { NgxsModule } from '@ngxs/store';
import { ColidMatSnackBarService } from 'src/app/shared/colid-mat-snack-bar/colid-mat-snack-bar.service';

describe('AddFavoriteDialogComponent', () => {
  let component: AddFavoriteDialogComponent;
  let fixture: ComponentFixture<AddFavoriteDialogComponent>;

  class MockFavoritesService {}

  class MockMatDialogRef {
    close() {}
  }

  class MockAuthService {
    currentUserId$ = EMPTY;
  }

  class MockColidMatSnackBarService {
    info() {}
    success() {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddFavoriteDialogComponent],
      imports: [NgxsModule.forRoot()],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: FavoritesService,
          useClass: MockFavoritesService
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: AuthService,
          useClass: MockAuthService
        },
        {
          provide: ColidMatSnackBarService,
          useClass: MockColidMatSnackBarService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddFavoriteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
