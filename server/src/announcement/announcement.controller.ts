import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AnnouncementService } from './announcement.service';
import type { Comment, CreateAnnouncementDto, ReactionType } from './announcement.dto';

@ApiTags('announcements') // <-- Groups endpoints in Swagger
@Controller('announcements')
export class AnnouncementController {
    constructor(
        private readonly announcementService : AnnouncementService
    ) {} 

    @Post('')
    @ApiOperation({ summary: 'Create a new announcement' })
    @ApiResponse({ status: 201, description: 'Announcement created successfully' })
    createAnnouncement(@Body() dto : CreateAnnouncementDto) {
        return this.announcementService.createAnnouncement(dto);
    }

    @Get('')
    @ApiOperation({ summary: 'Get all announcements' })
    @ApiResponse({ status: 200, description: 'List of announcements' })
    getAnnouncements() {
        return this.announcementService.getAnnouncements();
    }
    
    @Patch(':id')
    @ApiOperation({ summary: 'Update announcement status' })
    @ApiParam({ name: 'id', type: String })
    updateAnnouncementStatus(@Param('id') id : string) {
        return this.announcementService.updateAnnouncementStatus(id);
    }

    @Post(':id/comments')
    @ApiOperation({ summary: 'Add a comment to an announcement' })
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ type: Object, description: 'Comment object' })
    addComments(@Param('id') id : string , @Body() comment : Comment ) {
        return this.announcementService.addComments(id , comment);
    }  

    @Get(':id/comments')
    @ApiOperation({ summary: 'Get comments for an announcement' })
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({ status: 200, description: 'List of comments' })
    getComments(@Param('id') id : string , @Body('cursor') cursor? : string , @Body('limit') limit? : number) {
        return this.announcementService.getComments(id , cursor , limit);
    }

    @Post(':id/reactions')
    @ApiOperation({ summary: 'Add a reaction to an announcement' })
    @ApiParam({ name: 'id', type: String })
    @ApiHeader({ name: 'idempotency-key', description: 'Ensures idempotent reaction requests' })
    @ApiBody({ schema: { 
        type: 'object', 
        properties: { type: { type: 'string' }, userId: { type: 'string' } } 
    }})
    addReaction(
        @Param('id') id : string,
        @Headers('idempotency-key') idempotencyKey:string, 
        @Body('type') type: ReactionType,
        @Body('userId') userId: string
    ) {
        return this.announcementService.addReaction(id, userId, type, idempotencyKey);
    }

    @Delete(':id/reactions')
    @ApiOperation({ summary: 'Remove a reaction from an announcement' })
    @ApiParam({ name: 'id', type: String })
    @ApiHeader({ name: 'x-user-id', description: 'User performing the reaction removal' })
    removeReaction(@Param('id') id : string , @Headers('x-user-id') userId: string) {
        return this.announcementService.removeReaction(id , userId);
    }
}
