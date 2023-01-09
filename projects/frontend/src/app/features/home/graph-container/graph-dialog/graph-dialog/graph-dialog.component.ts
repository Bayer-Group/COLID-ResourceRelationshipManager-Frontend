import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Link } from '../../../../../core/d3';
import { GraphLinkSearchDto } from '../../../../../shared/models/graph-link-serarch-dto';
import { GraphComponent } from '../../graph/graph.component';
import { Constants } from '../../../../../shared/constants';
import { IconTypes } from '../../../../../shared/icons/models/icon-types';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'colid-graph-dialog',
  templateUrl: './graph-dialog.component.html',
  styleUrls: ['./graph-dialog.component.scss']
})
export class GraphDialogComponent implements OnInit {

  links: Link[] = [];

  loading: boolean = false;
  nameHeaderClicked: boolean = false;
  hoveredKey: string = "";
  searchParams: GraphLinkSearchDto = new GraphLinkSearchDto();
  mapPageSize: number = 12;
  checkScroll: boolean = false;
  constants = Constants;

  selection = new SelectionModel<Link>(true, []);

  S3: IconTypes = IconTypes.S3;

  @ViewChild('infiniteScroller', { static: false }) infiniteScroller!: ElementRef;
  @ViewChild(MatTable) table!: MatTable<any>;

  constructor(
    public dialogRef: MatDialogRef<GraphComponent>, library: FaIconLibrary,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.links = this.data.links
    this.selection.select(...this.links.filter(l => l.isRendered));
    library.addIconPacks(fas);
  }

  ngOnInit() {
  }

  getSortIconCode() {
    return this.searchParams.sortType == 'asc' ? 'arrow_upward' : (this.searchParams.sortType == 'des' ? 'arrow_downward' : 'swap_vert');
  }

  canDisplayIcon(name: string): boolean {
    return (this.searchParams.sortKey == name && this.searchParams.sortType != '') || this.hoveredKey == name;
  }

  onScroll($event: any) {
    if (this.checkScroll) return;

    if (this.links.length == this.mapPageSize && !!this.infiniteScroller && this.infiniteScroller.nativeElement.scrollTop != 0) {
      this.checkScroll = true;

      setTimeout(() => {
        this.checkScroll = false;
      }, 200);
    }
  }

  isOverflow(el: HTMLElement): boolean {
    let curOverflow = el.style.overflow;
    if (!curOverflow || curOverflow === "visible")
      el.style.overflow = "hidden";
    let isOverflowing = el.clientWidth < el.scrollWidth
      || el.clientHeight < el.scrollHeight;
    el.style.overflow = curOverflow;
    return isOverflowing;
  }


  applyFilter(event: any) {
    const filterValue: string = (event.target as HTMLInputElement).value;
    if (event.target && event.target.value) {
      var term = event.target.value;
      if (event.target.value) {
        if (!term) {
          this.links = this.data.links;
        }
        else {
          this.links = this.data.links.filter((x: any) =>
            (x.targetName.trim().toLowerCase().includes(term.trim().toLowerCase()) && x.outbound)
            || (x.targetName.trim().toLowerCase().includes(term.trim().toLowerCase()) && !x.outbound)
          );
        }
      }
    } else {
      this.links = this.data.links;
    }
    if (filterValue.length == 0)
    this.nameHeaderClicked = false;
  }

  changeSorting(attribute: string) {
    if (this.searchParams.sortKey == attribute) {
      this.searchParams.sortType = this.searchParams.sortType == 'asc' ? 'des' : 'asc';
    } else {
      this.searchParams.sortKey = attribute;
      this.searchParams.sortType = 'asc';
    }



    this.links = (this.data.links as Link[]).sort((a: Link, b: Link) => {
      var result = 0;

      if (attribute == "outbound") {
        if (a.outbound > b.outbound) {
          result = -1
        }
        if (a.outbound < b.outbound) {
          result = 1;
        }
        if (a.outbound == b.outbound) {
          result = 0;
        }
      }

      if (attribute == 'targetType') {
        var aType = a.outbound ? a.sourceType : a.targetType;
        var bType = b.outbound ? b.sourceType : b.targetType;
        if (aType > bType) {
          result = -1;
        }
        if (aType < bType) {
          result = 1;
        }
        if (aType == bType) {
          result = 0;
        }
      }

      if (attribute == 'linkType') {
        if (a.linkType.value > b.linkType.value) {
          result = -1;
        }
        if (a.linkType.value < b.linkType.value) {
          result = 1;
        }
        if (a.linkType.value == b.linkType.value) {
          result = 0;
        }
      }

      if (this.searchParams.sortType == "des") {
        result = result * -1;
      }

      return result;
    });
    this.table.renderRows();
  }

  loadLinks() {
    this.links.forEach(l => {
      //loop through all links and update the isRendered property to correct value
      const linkIndex = this.selection.selected.findIndex(s => s.source == l.source && s.target == l.target && s.linkType == l.linkType);
      if (linkIndex > -1) {
        l.isRendered = true;
      } else {
        l.isRendered = false;
      }
    })
    this.dialogRef.close(this.links);
  }

}


