export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
  companyId?: string;
  vendorId?: string;
}

export interface JwtPayload {
  sub: string; // User ID
  username: string;
  role: string;
  companyId?: string;
  vendorId?: string;
}
