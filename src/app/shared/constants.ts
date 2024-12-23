export const IDENT_PROV = 'IdentityProvider';
import { environment } from '../../environments/environment';

export const Constants = {
  ResourceTypes: {
    ConsumerGroup: `https://pid.${environment.baseUrl}/kos/19050#ConsumerGroup`,
    Table: `https://pid.${environment.baseUrl}/kos/19050/444586`,
    Column: `https://pid.${environment.baseUrl}/kos/19050/444582`,
    Dataset: `https://pid.${environment.baseUrl}/kos/19050/NonRDFDataset`,
    Document: `http://pid.${environment.baseUrl}/kos/19014/Document`
  },
  ConsumerGroup: {
    HasPidUriTemplate: `https://pid.${environment.baseUrl}/kos/19050#hasPidUriTemplate`
  },
  Authentication: {
    Roles: {
      Administration: 'COLID.Administration.ReadWrite',
      SuperAdministration: 'COLID.Superadministration.ReadWrite'
    }
  },
  Logging: {
    Product: 'DMP',
    Layer: 'Frontend(Angular)'
  },
  Search: {
    DidYouMeanField: 'hasResourceDefinition.value'
  },
  Shacl: {
    Group: 'http://www.w3.org/ns/shacl#group',
    Groups: {
      LinkTypes: `http://pid.${environment.baseUrl}/kos/19050/LinkTypes`
    },
    Name: 'http://www.w3.org/ns/shacl#name',
    Order: 'http://www.w3.org/ns/shacl#order',
    Taxonomy: 'taxonomy'
  },
  Resource: {
    // For Resource Id
    Prefix: `https://pid.${environment.baseUrl}/kos/19050#`,
    LifeCycleStatus: {
      Draft: `https://pid.${environment.baseUrl}/kos/19050/draft`,
      Published: `https://pid.${environment.baseUrl}/kos/19050/published`,
      Historic: `https://pid.${environment.baseUrl}/kos/19050/historic`,
      MarkedDeletion: `https://pid.${environment.baseUrl}/kos/19050/markedForDeletion`
    },
    Groups: {
      InvisibleTechnicalInformation: `http://pid.${environment.baseUrl}/kos/19050/InvisibleTechnicalInformation`,
      TechnicalInformation: `https://pid.${environment.baseUrl}/kos/19050/TechnicalInformation`,
      LinkTypes: `http://pid.${environment.baseUrl}/kos/19050/LinkTypes`,
      DistributionEndpoints: `http://pid.${environment.baseUrl}/kos/19050/DistributionEndpoints`,
      Images: `https://pid.${environment.baseUrl}/kos/19050/AttachmentsPropertyGroup`
    }
  },
  Metadata: {
    Author: `https://pid.${environment.baseUrl}/kos/19050/author`,
    HasDraftVersion: `https://pid.${environment.baseUrl}/kos/19050/hasDraftVersion`,
    HasPublishedVersion: `https://pid.${environment.baseUrl}/kos/19050/hasPublishedVersion`,
    Type: {
      Decimal: 'http://www.w3.org/2001/XMLSchema#decimal',
      Boolean: 'http://www.w3.org/2001/XMLSchema#boolean',
      DateTime: 'http://www.w3.org/2001/XMLSchema#dateTime',
      String: 'http://www.w3.org/2001/XMLSchema#string'
    },
    NodeType: {
      IRI: 'http://www.w3.org/ns/shacl#IRI',
      Literal: 'http://www.w3.org/ns/shacl#IRI'
    },
    Name: 'http://www.w3.org/ns/shacl#name',
    EntityType: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    Datatype: 'http://www.w3.org/ns/shacl#datatype',
    LifeCycleStatus: `https://pid.${environment.baseUrl}/kos/19050/hasEntryLifecycleStatus`,
    Comment: 'http://www.w3.org/2000/01/rdf-schema#comment',
    Group: 'http://www.w3.org/ns/shacl#group',
    HasLabel: `https://pid.${environment.baseUrl}/kos/19050/hasLabel`,
    HasBaseUri: `https://pid.${environment.baseUrl}/kos/19050/hasBaseURI`,
    HasResourceDefinition: `https://pid.${environment.baseUrl}/kos/19050/hasResourceDefinition`,
    HasPIDEditorialNote: `https://pid.${environment.baseUrl}/kos/19050/hasPIDEditorialNote`,
    DateCreated: `https://pid.${environment.baseUrl}/kos/19050/dateCreated`,
    LastChangeDateTime: `https://pid.${environment.baseUrl}/kos/19050/lastChangeDateTime`,
    LastReviewDateTime: `https://pid.${environment.baseUrl}/kos/19050/hasLastReviewDate`,
    HasConsumerGroup: `https://pid.${environment.baseUrl}/kos/19050#hasConsumerGroup`,
    HasLastChangeUser: `https://pid.${environment.baseUrl}/kos/19050/lastChangeUser`,
    HasVersion: `https://pid.${environment.baseUrl}/kos/19050/hasVersion`,
    HasPidUri: `http://pid.${environment.baseUrl}/kos/19014/hasPID`,
    HasTargetUri: `http://pid.${environment.baseUrl}/kos/19014/hasNetworkAddress`,
    PidUriTemplateIdType: `https://pid.${environment.baseUrl}/kos/19050#hasPidUriTemplateIdType`,
    PidUriTemplateSuffix: `https://pid.${environment.baseUrl}/kos/19050#hasPidUriTemplateSuffix`,
    DistributionEndpointLifecycleStatus: `https://pid.${environment.baseUrl}/kos/19050/hasDistributionEndpointLifecycleStatus`,
    ContactPerson: `https://pid.${environment.baseUrl}/kos/19050/hasContactPerson`,
    HasNetworkedResourceLabel: `https://pid.${environment.baseUrl}/kos/19050/hasNetworkedResourceLabel`,
    HasDataCategory: `https://pid.${environment.baseUrl}/kos/19050/hasDataCategory`,
    HasCountryContext: `https://pid.${environment.baseUrl}/kos/19050/hasCountryContext`,
    HasNextReviewDueDate: `https://pid.${environment.baseUrl}/kos/19050/hasNextReviewDueDate`,
    HasLastReviewer: `https://pid.${environment.baseUrl}/kos/19050/hasLastReviewer`,
    RDFS: {
      Range: 'http://www.w3.org/2000/01/rdf-schema#range',
      Label: 'http://www.w3.org/2000/01/rdf-schema#label'
    },
    DataSteward: `https://pid.${environment.baseUrl}/kos/19050/hasDataSteward`,
    NodeKind: 'http://www.w3.org/ns/shacl#nodeKind',
    Keywords: `https://pid.${environment.baseUrl}/kos/19050/47119343`,
    ContainsTherapeuticAreas: `https://pid.${environment.baseUrl}/d188c668-b710-45b2-9631-faf29e85ac8d/contains_information_about_therapeutic_area`,
    ContainsRwdDimensions: `https://pid.${environment.baseUrl}/d188c668-b710-45b2-9631-faf29e85ac8d/contains_rwd_dimension`,
    MainDistribution: `https://pid.${environment.baseUrl}/kos/19050/mainDistribution`,
    HasAttachment: `https://pid.${environment.baseUrl}/kos/19050/hasAttachment`,
    PIDConcept: `https://pid.${environment.baseUrl}/kos/19050/PID_Concept`,
    HasVersions: `https://pid.${environment.baseUrl}/kos/19050/hasVersions`,
    Distribution: `https://pid.${environment.baseUrl}/kos/19050/distribution`,
    HasBrokenDistributionEndpointLink: `https://pid.${environment.baseUrl}/kos/19050/hasEndpointURLStatus`,
    HasBrokenDataSteward: `https://pid.${environment.baseUrl}/kos/19050/hasBrokenDataSteward`,
    HasBrokenEndpointContact: `https://pid.${environment.baseUrl}/kos/19050/hasBrokenEndpointContact`,
    HasLaterVersion: `https://pid.${environment.baseUrl}/kos/19050/hasLaterVersion`,
    MetadataReleaseConfig: `https://pid.${environment.baseUrl}/kos/19050/646465`,
    BaseURIPointsAt: `https://pid.${environment.baseUrl}/kos/19050/baseURIPointsAt`,
    Link: {
      LifecycleStatus: {
        Deleted: `https://pid.${environment.baseUrl}/kos/19050/Deleted`,
        Created: `https://pid.${environment.baseUrl}/kos/19050/Created`
      }
    }
  },
  Identifier: {
    Type: `http://pid.${environment.baseUrl}/kos/19014/PermanentIdentifier`
  },
  DistributionEndpoint: {
    LifecycleStatus: {
      Active: `https://pid.${environment.baseUrl}/kos/19050/active`
    },
    DistributionEndpointKey: `https://pid.${environment.baseUrl}/kos/19050/distribution`
  },
  OWL: {
    Class: 'http://www.w3.org/2002/07/owl#Class',
    SubClass: 'http://www.w3.org/2000/01/rdf-schema#subClassOf'
  },
  Assets: {
    Logo: `https://shared.${environment.baseUrl}/img/logo.svg`
  }
};
