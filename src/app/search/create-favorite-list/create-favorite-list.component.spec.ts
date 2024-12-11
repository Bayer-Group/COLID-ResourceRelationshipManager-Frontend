import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateFavoriteListComponent } from './create-favorite-list.component';
import { NgxsModule } from '@ngxs/store';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { FavoritesService } from 'src/app/shared/services/favorites.service';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { EMPTY } from 'rxjs';
import { ColidMatSnackBarService } from 'src/app/shared/colid-mat-snack-bar/colid-mat-snack-bar.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateFavoriteListComponent', () => {
  let component: CreateFavoriteListComponent;
  let fixture: ComponentFixture<CreateFavoriteListComponent>;

  class MockFavoritesService {
    createFavoritesList() {}
  }

  class MockAuthService {
    currentUserId$ = EMPTY;
  }

  class MockColidMatSnackBarService {
    success() {}
    error() {}
  }

  class MockMatDialogRef {
    close() {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateFavoriteListComponent],
      imports: [
        NoopAnimationsModule,
        NgxsModule.forRoot(),
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule
      ],
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
          provide: AuthService,
          useClass: MockAuthService
        },
        {
          provide: ColidMatSnackBarService,
          useClass: MockColidMatSnackBarService
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateFavoriteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
