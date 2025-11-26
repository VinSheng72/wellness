import { PostalCodeResponseDto } from './dto/postal-code-response.dto';
export declare class LocationService {
    lookupPostalCode(code: string): Promise<PostalCodeResponseDto>;
}
