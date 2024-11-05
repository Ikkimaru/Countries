export interface CountryCoordinates {
  name: {
    common: string;
    official: string;
    nativeName: {
      [key: string]: {
        official: string;
        common: string;
      }
    }
  };
  latlng: [lat:number, lon:number];
  capitalInfo?:{latlng: number[];};
  cca2: string;
}
