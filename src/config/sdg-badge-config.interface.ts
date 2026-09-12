/**
 * Controls the Sustainable Development Goal badges shown on item pages.
 *
 * Values in the configured metadata fields may be a goal number (for example
 * "3" or "03"), or a controlled-vocabulary label beginning with that number
 * (for example "03: Good Health and Well-being").
 */
export interface SDGBadgeConfig {
  /** Enables the SDG badge panel. Items without matching metadata stay unchanged. */
  enabled: boolean;
  /** Metadata fields that contain the controlled SDG values. */
  metadataFields: string[];
}
