import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApproveEventDto } from './dto/approve-event.dto';
import { RejectEventDto } from './dto/reject-event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findAll(user: any): Promise<any[]>;
    findOne(id: string, user: any): Promise<any>;
    create(createEventDto: CreateEventDto, user: any): Promise<any>;
    approve(id: string, approveDto: ApproveEventDto, user: any): Promise<any>;
    reject(id: string, rejectDto: RejectEventDto, user: any): Promise<any>;
}
