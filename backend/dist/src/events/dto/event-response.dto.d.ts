export declare class EventResponseDto {
    id: string;
    companyId: string;
    eventItemId: string;
    vendorId: string;
    proposedDates: Date[];
    location: {
        postalCode: string;
        streetName: string;
    };
    status: string;
    confirmedDate?: Date;
    remarks?: string;
    dateCreated: Date;
    lastModified: Date;
}
