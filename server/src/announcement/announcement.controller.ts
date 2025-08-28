import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import type { CreateAnnouncementDto } from './announcement.dto';

@Controller('announcements')
export class AnnouncementController {
    constructor(
        private readonly announcementService : AnnouncementService
    ) {} 
    @Post('')
    createAnnouncement(@Body() dto : CreateAnnouncementDto) {
        return this.announcementService.createAnnouncement(dto);
    }

    @Get('')
    getAnnouncements() {
        return this.announcementService.getAnnouncements();
    }

    @Patch(':id')
    updateAnnouncementStatus(@Param('id') id : string) {
        return this.announcementService.updateAnnouncementStatus(id);
    }
}
