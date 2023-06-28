import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Store } from '@ngxs/store';
import { ResetAll } from '../../../state/graph-data.state';
import { ResetLinking } from '../../../state/graph-linking.state';
import { SetCurrentMap } from '../../../state/map-data.state';
import { Observable } from 'rxjs';
import { StatusBuildInformationDto } from 'src/app/shared/models/dto/status-build-information-dto';
import { StatusApiService } from 'src/app/shared/services/status.api.service';
import { MatDialog } from '@angular/material/dialog';
import { HelpComponent } from './help/help.component';

@Component({
  selector: 'colid-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  buildInformation$: Observable<StatusBuildInformationDto>;
  environmentLabel =
    environment.environment == 'Prod' ? '' : environment.environment;

  constructor(
    private store: Store,
    private statusApiService: StatusApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.buildInformation$ = this.statusApiService.getBuildInformation();
  }

  newMap() {
    this.store.dispatch(new SetCurrentMap(null));
    this.store.dispatch(new ResetAll());
    this.store.dispatch(new ResetLinking());
  }

  openHelpDialog() {
    this.dialog.open(HelpComponent, {
      data: {
        buildInformation$: this.buildInformation$,
      },
    });
  }
}
