import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
export declare class UsersRepository {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findByUsername(username: string): Promise<UserDocument | null>;
    findById(id: string | Types.ObjectId): Promise<UserDocument | null>;
    create(userData: Partial<User>): Promise<UserDocument>;
}
