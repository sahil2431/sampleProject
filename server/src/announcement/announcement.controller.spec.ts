import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { ForbiddenException } from '@nestjs/common';

describe('AnnouncementController', () => {
  let controller: AnnouncementController;
  let service: AnnouncementService;

  const mockService = {
    createAnnouncement: jest.fn(),
    getAnnouncements: jest.fn(),
    updateAnnouncementStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementController],
      providers: [{ provide: AnnouncementService, useValue: mockService }],
    }).compile();

    controller = module.get<AnnouncementController>(AnnouncementController);
    service = module.get<AnnouncementService>(AnnouncementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createAnnouncement should call service and return result', () => {
    const dto = { title: 'Title', description: 'Desc' };
    const expected = { id: '1', ...dto, status: 'active', createdAt: new Date().toISOString() };
    mockService.createAnnouncement.mockReturnValue(expected);

    const result = controller.createAnnouncement(dto);

    expect(result).toEqual(expected);
    expect(service.createAnnouncement).toHaveBeenCalledWith(dto);
  });

  it('getAnnouncements should return list from service', () => {
    const expected = [{ id: '1', title: 'x', description: '', status: 'active', createdAt: new Date().toISOString() }];
    mockService.getAnnouncements.mockReturnValue(expected);

    const result = controller.getAnnouncements();

    expect(result).toEqual(expected);
    expect(service.getAnnouncements).toHaveBeenCalled();
  });

  it('updateAnnouncementStatus should return updated announcement', () => {
    const expected = { id: '1', title: 'x', description: '', status: 'closed', createdAt: new Date().toISOString() };
    mockService.updateAnnouncementStatus.mockReturnValue(expected);

    const result = controller.updateAnnouncementStatus('1');

    expect(result).toEqual(expected);
    expect(service.updateAnnouncementStatus).toHaveBeenCalledWith('1');
  });

  it('updateAnnouncementStatus should bubble up exceptions', () => {
    mockService.updateAnnouncementStatus.mockImplementation(() => {
      throw new ForbiddenException('Announcement not found');
    });

    expect(() => controller.updateAnnouncementStatus('bad-id')).toThrow(ForbiddenException);
  });
});
