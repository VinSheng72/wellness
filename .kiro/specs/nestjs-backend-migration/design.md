# Design Document

## Overview

This design document outlines the migration of the Wellness Event Booking System from a Next.js monolithic architecture to a dedicated NestJS backend with a separate Next.js frontend. The migration will create two independent applications:

1. **NestJS Backend**: A standalone RESTful API service handling all business logic, data access, authentication, and authorization
2. **Next.js Frontend**: A client-side application focused solely on UI rendering and user interactions

The NestJS backend will leverage the framework's modular architecture, dependency injection, decorators, and built-in features (guards, interceptors, pipes) to create a robust, maintainable, and scalable API. The frontend will communicate with the backend via HTTP requests using JWT tokens for authentication.

This separation enables independent scaling, deployment, and development of frontend and backend services, improves code organization, and provides a foundation for potential future mobile applications or third-party integrations.

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js Frontend                       │
│                  (Port 3000)                             │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │         React Components                            │ │
│  │  - Login Page                                       │ │
│  │  - HR Dashboard                                     │ │
│  │  - Vendor Dashboard                                 │ │
│  │  - Event Forms & Modals                            │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         HTTP Client (fetch/axios)                   │ │
│  │  - JWT Token Management                            │ │
│  │  - API Request/Response Handling                   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS + CORS
                          │ Authorization: Bearer <JWT>
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   NestJS Backend                         │
│                  (Port 3001)                             │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │         API Gateway Layer                           │ │
│  │  - CORS Middleware                                  │ │
│  │  - Global Exception Filter                         │ │
│  │  - Validation Pipe                                  │ │
│  │  - Logger Middleware                                │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Controllers Layer                           │ │
│  │  - AuthController                                   │ │
│  │  - EventsController                                 │ │
│  │  - EventItemsController                            │ │
│  │  - UsersController                                  │ │
│  │  - HealthController                                 │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Guards & Interceptors                       │ │
│  │  - JwtAuthGuard                                     │ │
│  │  - RolesGuard                                       │ │
│  │  - LoggingInterceptor                              │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Services Layer                              │ │
│  │  - AuthService                                      │ │
│  │  - EventsService                                    │ │
│  │  - UsersService                                     │ │
│  │  - LocationService                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Repositories Layer                          │ │
│  │  - UserRepository                                   │ │
│  │  - EventRepository                                  │ │
│  │  - CompanyRepository                                │ │
│  │  - VendorRepository                                 │ │
│  │  - EventItemRepository                             │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Mongoose Models                             │ │
│  │  - User Schema                                      │ │
│  │  - Event Schema                                     │ │
│  │  - Company Schema                                   │ │
│  │  - Vendor Schema                                    │ │
│  │  - EventItem Schema                                │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Mongoose ODM
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                      │
│  Collections: users, events, companies, vendors,         │
│               eventItems                                 │
└─────────────────────────────────────────────────────────┘
```

### NestJS Module Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── config/                          # Configuration
│   ├── config.module.ts
│   └── configuration.ts
├── common/                          # Shared utilities
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   └── pipes/
│       └── validation.pipe.ts
├── database/                        # Database configuration
│   ├── database.module.ts
│   └── database.providers.ts
├── auth/                            # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   └── dto/
│       ├── login.dto.ts
│       └── auth-response.dto.ts
├── users/                           # Users module
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   ├── schemas/
│   │   └── user.schema.ts
│   └── dto/
│       └── user.dto.ts
├── events/                          # Events module
│   ├── events.module.ts
│   ├── events.controller.ts
│   ├── events.service.ts
│   ├── events.repository.ts
│   ├── schemas/
│   │   └── event.schema.ts
│   └── dto/
│       ├── create-event.dto.ts
│       ├── approve-event.dto.ts
│       ├── reject-event.dto.ts
│       └── event-response.dto.ts
├── event-items/                     # Event Items module
│   ├── event-items.module.ts
│   ├── event-items.controller.ts
│   ├── event-items.service.ts
│   ├── event-items.repository.ts
│   ├── schemas/
│   │   └── event-item.schema.ts
│   └── dto/
│       └── event-item.dto.ts
├── companies/                       # Companies module
│   ├── companies.module.ts
│   ├── companies.service.ts
│   ├── companies.repository.ts
│   ├── schemas/
│   │   └── company.schema.ts
│   └── dto/
│       └── company.dto.ts
├── vendors/                         # Vendors module
│   ├── vendors.module.ts
│   ├── vendors.service.ts
│   ├── vendors.repository.ts
│   ├── schemas/
│   │   └── vendor.schema.ts
│   └── dto/
│       └── vendor.dto.ts
├── location/                        # Location service module
│   ├── location.module.ts
│   ├── location.service.ts
│   └── dto/
│       └── postal-code.dto.ts
└── health/                          # Health check module
    ├── health.module.ts
    └── health.controller.ts
```

### Technology Stack

**Backend (NestJS)**:
- **Framework**: NestJS 10+ with TypeScript 5+
- **Runtime**: Node.js 20+
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT strategy
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI (@nestjs/swagger)
- **Testing**: Jest, Supertest, fast-check
- **Logging**: NestJS built-in Logger

**Frontend (Next.js)**:
- **Framework**: Next.js 14+ with App Router
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **HTTP Client**: Native fetch API or axios
- **State Management**: React Context for auth state
- **Testing**: Jest, React Testing Library

**DevOps**:
- **Containerization**: Docker and Docker Compose
- **Process Manager**: PM2 (for non-containerized deployments)
- **Reverse Proxy**: Nginx (optional, for production)

## Components and Interfaces

### Backend Components

#### 1. Main Application (main.ts)
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Wellness Event Booking API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(process.env.PORT || 3001);
}
```

#### 2. Auth Module

**AuthController**:
```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() refreshDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async logout(@CurrentUser() user: User): Promise<void> {
    return this.authService.logout(user.id);
  }
}
```

**AuthService**:
```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user._id,
      username: user.username,
      role: user.role,
      companyId: user.companyId,
      vendorId: user.vendorId,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        vendorId: user.vendorId,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

**JwtAuthGuard**:
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

**RolesGuard**:
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

#### 3. Events Module

**EventsController**:
```typescript
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async findAll(@CurrentUser() user: User): Promise<EventResponseDto[]> {
    if (user.role === 'HR_ADMIN') {
      return this.eventsService.findByCompany(user.companyId);
    } else {
      return this.eventsService.findByVendor(user.vendorId);
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.findById(id);
    await this.eventsService.validateAccess(event, user);
    return event;
  }

  @Post()
  @Roles('HR_ADMIN')
  @UseGuards(RolesGuard)
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.create(createEventDto, user.companyId);
  }

  @Post(':id/approve')
  @Roles('VENDOR_ADMIN')
  @UseGuards(RolesGuard)
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveEventDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.approve(id, approveDto, user.vendorId);
  }

  @Post(':id/reject')
  @Roles('VENDOR_ADMIN')
  @UseGuards(RolesGuard)
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectEventDto,
    @CurrentUser() user: User,
  ): Promise<EventResponseDto> {
    return this.eventsService.reject(id, rejectDto, user.vendorId);
  }
}
```

**EventsService**:
```typescript
@Injectable()
export class EventsService {
  constructor(
    private eventsRepository: EventsRepository,
    private eventItemsService: EventItemsService,
  ) {}

  async create(createEventDto: CreateEventDto, companyId: string): Promise<Event> {
    // Get vendor from event item
    const eventItem = await this.eventItemsService.findById(createEventDto.eventItemId);
    
    const event = {
      ...createEventDto,
      companyId,
      vendorId: eventItem.vendorId,
      status: 'Pending',
      dateCreated: new Date(),
      lastModified: new Date(),
    };

    return this.eventsRepository.create(event);
  }

  async findByCompany(companyId: string): Promise<Event[]> {
    return this.eventsRepository.findByCompany(companyId);
  }

  async findByVendor(vendorId: string): Promise<Event[]> {
    return this.eventsRepository.findByVendor(vendorId);
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async approve(id: string, approveDto: ApproveEventDto, vendorId: string): Promise<Event> {
    const event = await this.findById(id);
    
    if (event.vendorId.toString() !== vendorId) {
      throw new ForbiddenException('Not authorized to approve this event');
    }

    if (event.status !== 'Pending') {
      throw new BadRequestException('Only pending events can be approved');
    }

    if (!event.proposedDates.includes(approveDto.confirmedDate)) {
      throw new BadRequestException('Confirmed date must be one of the proposed dates');
    }

    return this.eventsRepository.update(id, {
      status: 'Approved',
      confirmedDate: approveDto.confirmedDate,
      lastModified: new Date(),
    });
  }

  async reject(id: string, rejectDto: RejectEventDto, vendorId: string): Promise<Event> {
    const event = await this.findById(id);
    
    if (event.vendorId.toString() !== vendorId) {
      throw new ForbiddenException('Not authorized to reject this event');
    }

    if (event.status !== 'Pending') {
      throw new BadRequestException('Only pending events can be rejected');
    }

    return this.eventsRepository.update(id, {
      status: 'Rejected',
      remarks: rejectDto.remarks,
      lastModified: new Date(),
    });
  }

  async validateAccess(event: Event, user: User): Promise<void> {
    if (user.role === 'HR_ADMIN' && event.companyId.toString() !== user.companyId) {
      throw new ForbiddenException('Not authorized to access this event');
    }
    if (user.role === 'VENDOR_ADMIN' && event.vendorId.toString() !== user.vendorId) {
      throw new ForbiddenException('Not authorized to access this event');
    }
  }
}
```

#### 4. Health Check Module

**HealthController**:
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

### Data Transfer Objects (DTOs)

**LoginDto**:
```typescript
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'hr_admin' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password123' })
  password: string;
}
```

**CreateEventDto**:
```typescript
export class CreateEventDto {
  @IsMongoId()
  @ApiProperty()
  eventItemId: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsDateString({}, { each: true })
  @ApiProperty({ type: [String], example: ['2024-01-15', '2024-01-16', '2024-01-17'] })
  proposedDates: string[];

  @ValidateNested()
  @Type(() => LocationDto)
  @ApiProperty()
  location: LocationDto;
}

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  streetName: string;
}
```

**ApproveEventDto**:
```typescript
export class ApproveEventDto {
  @IsDateString()
  @ApiProperty({ example: '2024-01-15' })
  confirmedDate: string;
}
```

**RejectEventDto**:
```typescript
export class RejectEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @ApiProperty({ example: 'Unable to accommodate due to scheduling conflicts' })
  remarks: string;
}
```

### Frontend Components

#### API Client Service

```typescript
// lib/api/client.ts
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request
        return this.request(endpoint, options);
      } else {
        this.clearToken();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async login(username: string, password: string) {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('refreshToken') 
        : null;
      
      if (!refreshToken) return false;

      const data = await this.request<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      
      this.setToken(data.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  async getEvents() {
    return this.request<Event[]>('/events', { method: 'GET' });
  }

  async createEvent(eventData: CreateEventDto) {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async approveEvent(id: string, confirmedDate: string) {
    return this.request<Event>(`/events/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ confirmedDate }),
    });
  }

  async rejectEvent(id: string, remarks: string) {
    return this.request<Event>(`/events/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async getEventItems() {
    return this.request<EventItem[]>('/event-items', { method: 'GET' });
  }
}

export const apiClient = new ApiClient();
```

## Data Models

The data models remain the same as the original design, using Mongoose schemas:

### User Schema
```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['HR_ADMIN', 'VENDOR_ADMIN'] })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
  vendorId?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### Event Schema
```typescript
@Schema({ timestamps: true })
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EventItem', required: true })
  eventItemId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true })
  vendorId: Types.ObjectId;

  @Prop({ type: [Date], required: true, validate: [(val) => val.length === 3, 'Must have exactly 3 proposed dates'] })
  proposedDates: Date[];

  @Prop({ type: Object, required: true })
  location: {
    postalCode: string;
    streetName: string;
  };

  @Prop({ required: true, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
  status: string;

  @Prop({ type: Date })
  confirmedDate?: Date;

  @Prop()
  remarks?: string;

  @Prop({ default: Date.now })
  dateCreated: Date;

  @Prop({ default: Date.now })
  lastModified: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Indexes
EventSchema.index({ companyId: 1, dateCreated: -1 });
EventSchema.index({ vendorId: 1, dateCreated: -1 });
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Successful requests return appropriate status codes
*For any* valid API request, the response should have an HTTP status code in the 2xx range (200, 201, or 204)
**Validates: Requirements 2.2**

### Property 2: Failed requests return appropriate error codes
*For any* invalid API request, the response should have an appropriate HTTP error status code (400, 401, 403, 404, or 500) and include a descriptive error message
**Validates: Requirements 2.3**

### Property 3: Response format consistency
*For any* API endpoint response, the response should follow a consistent JSON structure with standard fields
**Validates: Requirements 2.4**

### Property 4: Valid credentials return tokens
*For any* valid user credentials submitted to the login endpoint, the response should include both an access token and a refresh token
**Validates: Requirements 3.1**

### Property 5: Token validation on authenticated requests
*For any* authenticated endpoint, requests without a valid JWT token in the Authorization header should be rejected with 401 Unauthorized
**Validates: Requirements 3.2**

### Property 6: Invalid token rejection
*For any* invalid or expired JWT token, requests using that token should return 401 Unauthorized
**Validates: Requirements 3.3**

### Property 7: Role-based access control
*For any* endpoint protected by role guards, users with incorrect roles should be denied access with 403 Forbidden
**Validates: Requirements 3.4**

### Property 8: Token refresh round-trip
*For any* valid refresh token, submitting it to the refresh endpoint should return a new valid access token
**Validates: Requirements 3.5**

### Property 9: Database error handling
*For any* database operation failure, the system should return an appropriate error response without exposing internal error details
**Validates: Requirements 4.5**

### Property 10: Event creation with correct initial state
*For any* valid event creation request from an HR Admin, the created event should have status "Pending", include all provided data, and be assigned to the correct vendor
**Validates: Requirements 5.1**

### Property 11: Event data isolation by role
*For any* authenticated user requesting events, the returned events should only include those belonging to the user's organization (company for HR Admin, vendor for Vendor Admin)
**Validates: Requirements 5.2**

### Property 12: Event approval updates state correctly
*For any* pending event and valid approval request from the associated Vendor Admin, the event status should be updated to "Approved" and the confirmed date should be set
**Validates: Requirements 5.3**

### Property 13: Event rejection updates state correctly
*For any* pending event and valid rejection request from the associated Vendor Admin, the event status should be updated to "Rejected" and the remarks should be stored
**Validates: Requirements 5.4**

### Property 14: Event access authorization
*For any* event ID, users should only be able to retrieve event details if they are authorized (HR Admin from same company or Vendor Admin from same vendor)
**Validates: Requirements 5.5**

### Property 15: Invalid data validation
*For any* API request with invalid data, the system should return 400 Bad Request with detailed validation error messages indicating which fields are invalid
**Validates: Requirements 6.2**

### Property 16: Three proposed dates validation
*For any* event creation request, the system should reject requests that don't have exactly three proposed dates
**Validates: Requirements 6.3**

### Property 17: Rejection remarks validation
*For any* event rejection request with empty or whitespace-only remarks, the system should reject the request with a validation error
**Validates: Requirements 6.4**

### Property 18: Consistent error formatting
*For any* error response from any endpoint, the error should follow a consistent format with error code, message, and optional details
**Validates: Requirements 8.1**

### Property 19: Unhandled exception handling
*For any* unhandled exception during request processing, the system should return 500 Internal Server Error with a generic message (not exposing internal details)
**Validates: Requirements 8.2**

### Property 20: Validation error structure
*For any* validation error, the error response should include structured information indicating which specific fields failed validation and why
**Validates: Requirements 8.3**

## Error Handling

### Global Exception Filter

The NestJS backend implements a global exception filter that catches all errors and formats them consistently:

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error
    Logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
      'HttpExceptionFilter',
    );

    // Send consistent error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(errors && { errors }),
    });
  }
}
```

### Error Response Format

All errors follow this consistent structure:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/events",
  "message": "Validation failed",
  "errors": [
    {
      "field": "proposedDates",
      "message": "proposedDates must contain exactly 3 elements"
    }
  ]
}
```

### HTTP Status Codes

- **200 OK**: Successful GET request
- **201 Created**: Successful POST request creating a resource
- **204 No Content**: Successful DELETE request or logout
- **400 Bad Request**: Validation errors, invalid input
- **401 Unauthorized**: Missing, invalid, or expired authentication token
- **403 Forbidden**: Valid authentication but insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., username already exists)
- **500 Internal Server Error**: Unhandled server errors
- **503 Service Unavailable**: Database connection failure, health check failure

### Validation Errors

Validation errors are automatically handled by NestJS ValidationPipe and return detailed field-level errors:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/events",
  "message": "Validation failed",
  "errors": [
    {
      "property": "proposedDates",
      "constraints": {
        "arrayMinSize": "proposedDates must contain at least 3 elements",
        "arrayMaxSize": "proposedDates must contain no more than 3 elements"
      }
    },
    {
      "property": "location.postalCode",
      "constraints": {
        "isNotEmpty": "postalCode should not be empty"
      }
    }
  ]
}
```

### Database Errors

Database errors are caught and transformed into appropriate HTTP errors:

- **Connection failures**: 503 Service Unavailable
- **Document not found**: 404 Not Found
- **Duplicate key errors**: 409 Conflict
- **Validation errors**: 400 Bad Request
- **Other database errors**: 500 Internal Server Error (with generic message)

### Authentication Errors

- **Missing token**: 401 Unauthorized - "Authentication required"
- **Invalid token**: 401 Unauthorized - "Invalid or expired token"
- **Expired token**: 401 Unauthorized - "Token expired"
- **Invalid credentials**: 401 Unauthorized - "Invalid username or password"

### Authorization Errors

- **Insufficient permissions**: 403 Forbidden - "Insufficient permissions"
- **Wrong role**: 403 Forbidden - "This action requires [ROLE] role"
- **Unauthorized resource access**: 403 Forbidden - "Not authorized to access this resource"

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific components in isolation using mocked dependencies:

**Service Unit Tests**:
- Test business logic with mocked repositories
- Test error handling for various edge cases
- Test data transformation and validation
- Mock external dependencies (database, external APIs)

**Controller Unit Tests**:
- Test request handling with mocked services
- Test guard and decorator behavior
- Test response formatting
- Test error propagation

**Repository Unit Tests**:
- Test query construction
- Test data mapping between DTOs and entities
- Use in-memory MongoDB for isolated testing

**Key Unit Test Examples**:
- AuthService.login with valid credentials returns tokens
- EventsService.create assigns correct vendor from event item
- EventsService.approve rejects non-pending events
- RolesGuard denies access for wrong role
- ValidationPipe rejects invalid DTOs

### Integration Testing Approach

Integration tests verify the full request-response cycle:

**API Endpoint Tests (using Supertest)**:
- Test complete HTTP request/response flow
- Test authentication and authorization
- Test database persistence
- Test error responses
- Use test database (MongoDB Memory Server)

**Key Integration Test Examples**:
- POST /auth/login returns tokens and sets correct user data
- GET /events returns only events for authenticated user's organization
- POST /events creates event with all relationships
- POST /events/:id/approve updates event status and persists to database
- Unauthorized requests to protected endpoints return 401

### Property-Based Testing Approach

Property-based tests verify universal properties across all inputs using **fast-check** library. Each test will run a minimum of 100 iterations with randomly generated inputs.

**Property Test Configuration**:
```typescript
import fc from 'fast-check';

// Configure to run 100+ iterations per property
fc.assert(
  fc.property(/* arbitraries */, /* predicate */),
  { numRuns: 100 }
);
```

**Property Test Tagging Convention**:
Each property-based test must include a comment tag referencing the design document:
```typescript
// Feature: nestjs-backend-migration, Property 1: Successful requests return appropriate status codes
test('valid API requests return 2xx status codes', () => {
  // test implementation
});
```

**Generators (Arbitraries)**:
- **User Generator**: Creates random users with valid roles, credentials, and associations
- **Event Generator**: Creates random events with 3 proposed dates, valid locations, and status
- **Credentials Generator**: Creates random valid and invalid credential combinations
- **Token Generator**: Creates valid, expired, and invalid JWT tokens
- **Date Generator**: Creates random valid dates (past, present, future)
- **DTO Generator**: Creates random valid and invalid DTOs for all endpoints
- **Role Generator**: Creates random user roles for authorization testing

**Property Test Coverage**:
- Authentication: token generation, validation, refresh for all user types
- Authorization: role-based access control across all protected endpoints
- Event operations: creation, approval, rejection with various input combinations
- Data isolation: HR and Vendor data filtering across all queries
- Validation: input validation for all DTOs with various invalid inputs
- Error handling: consistent error formatting across all error scenarios
- Database operations: persistence and retrieval consistency

**Integration with CI/CD**:
- Property tests run on every commit
- Failed property tests report the minimal failing example for debugging
- Seed values logged for reproducibility

### Test Organization

```
backend/
  src/
    auth/
      __tests__/
        auth.service.spec.ts          # Unit tests
        auth.controller.spec.ts       # Unit tests
        auth.integration.spec.ts      # Integration tests
        auth.property.spec.ts         # Property-based tests
    events/
      __tests__/
        events.service.spec.ts
        events.controller.spec.ts
        events.integration.spec.ts
        events.property.spec.ts
    common/
      __tests__/
        guards.spec.ts
        filters.spec.ts
        error-handling.property.spec.ts
  test/
    e2e/
      app.e2e-spec.ts                 # End-to-end tests
      auth.e2e-spec.ts
      events.e2e-spec.ts

frontend/
  __tests__/
    api-client.test.ts                # API client unit tests
    components/
      LoginPage.test.tsx
      HRDashboard.test.tsx
      VendorDashboard.test.tsx
```

### Testing Tools

**Backend**:
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for integration tests
- **fast-check**: Property-based testing library
- **MongoDB Memory Server**: In-memory database for testing
- **@nestjs/testing**: NestJS testing utilities

**Frontend**:
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking for frontend tests

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: All API endpoints covered
- **Property Tests**: All critical business logic and correctness properties
- **E2E Tests**: Critical user flows (login, create event, approve/reject)

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────┐
│                   Developer Machine                      │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Next.js Frontend (localhost:3000)                  │ │
│  │  npm run dev                                        │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          │ HTTP                          │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  NestJS Backend (localhost:3001)                    │ │
│  │  npm run start:dev                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          │ MongoDB Protocol              │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  MongoDB (localhost:27017)                          │ │
│  │  docker-compose up mongodb                          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Docker Compose Development

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=mongodb://admin:password@mongodb:27017/wellness-events?authSource=admin
      - JWT_SECRET=dev-secret
      - JWT_REFRESH_SECRET=dev-refresh-secret
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      - mongodb
    volumes:
      - ./backend/src:/app/src

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
    depends_on:
      - backend
    volumes:
      - ./frontend/app:/app/app
      - ./frontend/lib:/app/lib

volumes:
  mongodb_data:
```

### Production Deployment

**Option 1: Cloud Platform (Vercel + MongoDB Atlas)**

```
┌─────────────────────────────────────────────────────────┐
│                   Vercel (Frontend)                      │
│  - Next.js Static/SSR                                    │
│  - CDN Distribution                                      │
│  - Automatic HTTPS                                       │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Cloud Provider                         │
│  (AWS ECS / GCP Cloud Run / Azure Container Instances)   │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  NestJS Backend Container                           │ │
│  │  - Auto-scaling                                     │ │
│  │  - Load Balancer                                    │ │
│  │  - Health Checks                                    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ MongoDB Protocol (TLS)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   MongoDB Atlas                          │
│  - Managed Database                                      │
│  - Automatic Backups                                     │
│  - Replication                                           │
└─────────────────────────────────────────────────────────┘
```

**Option 2: Self-Hosted with Docker**

```
┌─────────────────────────────────────────────────────────┐
│                   Server / VM                            │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Nginx Reverse Proxy                                │ │
│  │  - SSL Termination                                  │ │
│  │  - Static File Serving                              │ │
│  │  - Load Balancing                                   │ │
│  └────────────────────────────────────────────────────┘ │
│           │                           │                  │
│           │ /                         │ /api             │
│           ▼                           ▼                  │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  Frontend        │      │  Backend         │        │
│  │  Container       │      │  Container(s)    │        │
│  │  (Next.js)       │      │  (NestJS)        │        │
│  └──────────────────┘      └──────────────────┘        │
│                                      │                   │
│                                      │                   │
│                                      ▼                   │
│                            ┌──────────────────┐         │
│                            │  MongoDB         │         │
│                            │  Container       │         │
│                            └──────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### Environment Variables

**Backend (.env)**:
```bash
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=mongodb://username:password@host:27017/wellness-events

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info
```

**Frontend (.env)**:
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
```

### Dockerfile (Backend)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
```

### Health Checks and Monitoring

**Health Check Endpoint**: GET /health

Response when healthy:
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "details": {
    "database": {
      "status": "up"
    }
  },
  "uptime": 3600,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Response when unhealthy:
```json
{
  "status": "error",
  "info": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  },
  "error": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  }
}
```

### Migration Strategy

1. **Phase 1: Backend Setup**
   - Create NestJS project structure
   - Implement all modules, controllers, services
   - Set up database connection
   - Implement authentication and authorization
   - Write and run tests

2. **Phase 2: API Development**
   - Implement all API endpoints
   - Add validation and error handling
   - Set up Swagger documentation
   - Deploy backend to staging environment

3. **Phase 3: Frontend Migration**
   - Create API client service
   - Update authentication flow to use JWT tokens
   - Replace Next.js API routes with HTTP calls to backend
   - Update all components to use new API client
   - Test frontend with backend

4. **Phase 4: Testing and Validation**
   - Run full test suite (unit, integration, property-based)
   - Perform end-to-end testing
   - Load testing and performance validation
   - Security audit

5. **Phase 5: Deployment**
   - Deploy backend to production
   - Deploy frontend to production
   - Monitor logs and metrics
   - Gradual traffic migration if needed

### Rollback Strategy

- Keep old Next.js monolith running during migration
- Use feature flags to switch between old and new architecture
- Monitor error rates and performance metrics
- Quick rollback capability by reverting frontend to use old API routes
