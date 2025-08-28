import { ForbiddenException, Injectable } from "@nestjs/common";
import { AnnouncementBody, CreateAnnouncementDto } from "./announcement.dto";

let announcement : AnnouncementBody[] = [];
@Injectable()
export class AnnouncementService {

    createAnnouncement(dto : CreateAnnouncementDto) {
        const announmentBody = {
            id : Date.now().toString(),
            title : dto.title,
            description : dto?.description || '',
            status : 'active',
            createdAt : new Date().toISOString()
        }

        announcement.push(announmentBody)

        return announmentBody;
    }

    getAnnouncements() {
        //return all announcements with newest first
        announcement = announcement.sort((a , b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return announcement;

    }

    updateAnnouncementStatus(id : string) {
        const index = announcement.findIndex(a => a.id === id);
        if(index === -1) {
            throw new ForbiddenException('Announcement not found');
        }
        announcement[index].status = 'closed';
        return announcement[index];
    }
}