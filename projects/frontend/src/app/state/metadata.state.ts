import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { MetadataService } from '../core/metadata.service';
import { Constants } from '../shared/constants';

export class FetchMetadata {
  static readonly type = '[Metadata] FetchMetadata';
}

export class FetchMetadataTypes {
  static readonly type = '[Metadata] FetchMetadataTypes';
}

export interface MetadataStateModel {
  metadata: any;
  types: any;
}

@State<MetadataStateModel>({
  name: 'metadata',
  defaults: {
    metadata: null,
    types: null
  }
})

@Injectable({
  providedIn: 'root'
})
export class MetadataState {

  @Selector()
  public static getMetadata(state: MetadataStateModel) {
    return state.metadata;
  }

  @Selector()
  public static getMetadataTypes(state: MetadataStateModel) {
    return state.types;
  }

  constructor(private metadataService: MetadataService) { }

  ngxsOnInit(ctx: StateContext<MetadataStateModel>) {
  }

  @Action(FetchMetadata)
  fetchMetadata({ patchState }: StateContext<MetadataStateModel>, { }: FetchMetadata) {

    this.metadataService.getMetadata().subscribe(res => {
      const types = res[Constants.Metadata.EntityType].properties[Constants.Shacl.Taxonomy];
      patchState({
        types: types
      });

      patchState({
        metadata: res
      });
    });
  }

  @Action(FetchMetadataTypes)
  fetchMetadataTypes({ patchState }: StateContext<MetadataStateModel>, { }: FetchMetadataTypes) {
    this.metadataService.getMetadata().subscribe(res => {
      if (res) {
        const types = res[Constants.Metadata.EntityType].properties[Constants.Shacl.Taxonomy];
        patchState({
          types: types
        });
      } else {
        patchState({
          types: null
        });
      }
    });
  }
}
