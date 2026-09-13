/** Configuration for one metadata-driven goal framework. */
export interface GoalBadgeSetConfig {
  enabled: boolean;
  metadataFields: string[];
  countSearchFilter: string;
  imageFolder: string;
  imagePrefix: string;
  codes: string[];
}

/** All goal frameworks that may be rendered on an item page. */
export interface GoalBadgesConfig {
  [set: string]: GoalBadgeSetConfig;
}
