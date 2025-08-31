import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementService } from './announcement.service';
import { ForbiddenException } from '@nestjs/common';

describe('AnnouncementService', () => {
  let service: AnnouncementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnouncementService],
    }).compile();

    service = module.get<AnnouncementService>(AnnouncementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createAnnouncement should return new announcement with id, title, description, status, createdAt', () => {
    const dto = { title: 'Test announcement', description: 'Some description' };
    const result = service.createAnnouncement(dto);

    expect(result).toHaveProperty('id');
    expect(result.title).toBe('Test announcement');
    expect(result.description).toBe('Some description');
    expect(result.status).toBe('active');
    expect(result).toHaveProperty('createdAt');
  });

  it('getAnnouncements should return array sorted by createdAt (newest first)', () => {
    const first = service.createAnnouncement({ title: 'First', description: '' });
    const second = service.createAnnouncement({ title: 'Second', description: '' });

    const list = service.getAnnouncements();

    expect(list.length).toBeGreaterThanOrEqual(2);
    // newest (second) should be before oldest (first)
    expect(new Date(list[0].createdAt).getTime())
      .toBeGreaterThanOrEqual(new Date(list[1].createdAt).getTime());
  });

  it('updateAnnouncementStatus should update status to closed if exists', () => {
    const created = service.createAnnouncement({ title: 'Closable', description: '' });

    const updated = service.updateAnnouncementStatus(created.id);

    expect(updated.status).toBe('closed');
  });

  it('updateAnnouncementStatus should throw if not found', () => {
    expect(() => service.updateAnnouncementStatus('fake-id')).toThrow(ForbiddenException);
  });
});
