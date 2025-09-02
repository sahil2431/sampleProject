export interface CreateAnnouncementDto {
    title : string;
    description? : string;
}

export interface Comment {
    authorName : string
    text: string;
}
export interface AnnouncementBody extends CreateAnnouncementDto {
    id : string;
    status : string;
    createdAt : string;
    comments? : Comment[]; 
    reactions? : Reaction[];
}

export type ReactionType = 'up' | 'down' | 'heart';

export interface Reaction {
    userId: string;
    type: ReactionType;
    createdAt: string;
    idempotencyKey?: string;
}