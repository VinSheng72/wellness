import { UsersRepository } from './users.repository';
import { UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    findByUsername(username: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
}
