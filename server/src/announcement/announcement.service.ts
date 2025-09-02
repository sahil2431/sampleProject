import { ForbiddenException, Injectable } from "@nestjs/common";
import { AnnouncementBody, Comment, CreateAnnouncementDto, Reaction, ReactionType } from "./announcement.dto";

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

    addComments(id : string , comment : Comment) {
        const index = announcement.findIndex(a => a.id === id);
        if(index === -1) {
            throw new ForbiddenException('Announcement not found');
        }

        if(!announcement[index].comments) {
            announcement[index].comments = [];
        }

        announcement[index].comments.push(comment);
        return announcement[index];
    }

    getComments(id: string , cursor? : string , limit? : number) {
        const index = announcement.findIndex(a => a.id === id);

        if(index === -1) {
            throw new ForbiddenException('Announcement not found');
        }

        let comments = announcement[index].comments || [];

        if(cursor) {
            const cursorIndex = comments.findIndex(c => c.authorName === cursor);
            if(cursorIndex !== -1) {
                comments = comments.slice(cursorIndex + 1);
            }
        }

        if(limit) {
            comments = comments.slice(0 , limit);
        }

        return comments;
    }

    addReaction(id: string, userId: string, type: ReactionType, idempotencyKey?: string) {
        console.log(userId)
        const index = announcement.findIndex(a => a.id === id);
        if(index === -1) {
            throw new ForbiddenException('Announcement not found');
        }

        if(!announcement[index].reactions) {
            announcement[index].reactions = [];
        }

        // Check idempotency key if provided
        if (idempotencyKey) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const existingReaction = announcement[index].reactions.find(
                r => r.idempotencyKey === idempotencyKey && 
                     new Date(r.createdAt) > fiveMinutesAgo
            );
            if (existingReaction) {
                return announcement[index];
            }
        }

        // Remove existing reaction from same user if exists
        announcement[index].reactions = announcement[index].reactions.filter(
            r => r.userId !== userId
        );

        // Add new reaction
        const reaction: Reaction = {
            userId,
            type,
            createdAt: new Date().toISOString(),
            idempotencyKey
        };

        announcement[index].reactions.push(reaction);
        return announcement[index];
    }

    removeReaction(id: string, userId: string) {
        const index = announcement.findIndex(a => a.id === id);
        if(index === -1) {
            throw new ForbiddenException('Announcement not found');
        }

        if(!announcement[index].reactions) {
            return announcement[index];
        }

        const reactionIndex = announcement[index].reactions.findIndex(r => r.userId === userId);
        if(reactionIndex !== -1) {
            announcement[index].reactions.splice(reactionIndex, 1);
        }

        return announcement[index];
    }
}