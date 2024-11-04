export interface RegionInterface {
  name: {
    common: string;
    official: string;
    nativeName: {
      [languageCode: string]: {
        official: string;
        common: string;
      };
    };
  };
  cca2: string;
  region: string;
  subregion: string;
  population?: number;
  area?: number;
  "flag": string;
  flags?: {
    png?: string;
    svg?: string;
  };
  latlng?: number[];
  demonyms?: {
    [languageCode: string]: {
      f: string;
      m: string;
    };
  };
  translations?: {
    [languageCode: string]: {
      official: string;
      common: string;
    };
  };
  languages?: { [code: string]: string };
  capital?: string[];
  capitalInfo?:{latlng: number[];};
  timezones?: string[];
  maps?: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
  coatOfArms?: {
    png?: string;
    svg?: string;
  };
}
