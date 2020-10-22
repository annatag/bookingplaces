export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface PlaceLocation extends Coordinates {
    address: string;
    staticMapImageUrl: string;
}
