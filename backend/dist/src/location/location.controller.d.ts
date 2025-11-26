import { LocationService } from './location.service';
import { PostalCodeResponseDto } from './dto/postal-code-response.dto';
export declare class LocationController {
    private readonly locationService;
    constructor(locationService: LocationService);
    lookupPostalCode(code: string): Promise<PostalCodeResponseDto>;
}
