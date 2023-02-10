import { AfterViewInit, Component } from '@angular/core';
enum SiderBarPosition {
  Close = 0,
  HalfOpen = 1,
  FullOpen = 2,
}

@Component({
  selector: 'colid-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
  siderbarPosition: SiderBarPosition = SiderBarPosition.HalfOpen;
  SelectedMenuItem: string | undefined;
  SelectedTab: string | undefined;

  toogleIcon = 'arrow_left';

  sidebar: HTMLElement | null | undefined;

  ngAfterViewInit(): void {
    this.sidebar = document.getElementById('siderbarComponent');
  }

  switchTab = (tab: string): void => {
    this.SelectedMenuItem = tab;
    this.SelectedTab = tab;
  };

  toggleSidebar = (): void => {
    if (this.sidebar != undefined) {
      if (this.siderbarPosition == SiderBarPosition.HalfOpen) {
        this.sidebar.className = 'sidebarFull';
        this.toogleIcon = 'arrow_right';
        this.siderbarPosition = SiderBarPosition.FullOpen;
      } else if (this.siderbarPosition == SiderBarPosition.FullOpen) {
        this.sidebar.className = 'sidebarHalf';
        this.toogleIcon = 'arrow_left';
        this.siderbarPosition = SiderBarPosition.HalfOpen;
      } else if (this.siderbarPosition == SiderBarPosition.Close) {
        this.sidebar.className = 'sidebarHalf';
        this.toogleIcon = 'arrow_left';
        this.siderbarPosition = SiderBarPosition.HalfOpen;
        return;
      }
    }
  };

  closeSidebar = (): void => {
    if (this.sidebar != undefined) {
      this.sidebar.className = 'sidebarClose';
      this.toogleIcon = 'arrow_left';
      this.siderbarPosition = SiderBarPosition.Close;
    }
  };
}
