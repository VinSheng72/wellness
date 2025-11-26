export declare class UserResponseDto {
    id: string;
    username: string;
    role: string;
    companyId?: string;
    vendorId?: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
}
