export declare class LocationDto {
    postalCode: string;
    streetName: string;
}
export declare class CreateEventDto {
    eventItemId: string;
    proposedDates: string[];
    location: LocationDto;
}
