export interface CreateAnnouncementDto {
    title : string;
    description? : string;
}

export interface AnnouncementBody extends CreateAnnouncementDto {
    id : string;
    status : string;
    createdAt : string;
}