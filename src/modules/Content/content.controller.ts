import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ModuleModel } from '../Module/module.model';
import { LessonModel } from '../Lesson/lesson.model';
import { ResourceModel } from '../Resource/resource.model';
import { ModuleProgressModel } from '../Progress/moduleProgress.model';
import { ProgressService } from '../Progress/progress.service';
import { ProgressStatus } from '../../types/common';
import ApiError from '../../errors/ApiError';

/**
 * Get all modules for a batch with progress
 */
const getBatchModules = catchAsync(async (req: Request, res: Response) => {
    const { batchId } = req.params;
    const enrollment = (req as any).enrollment;

    // Get batch and course info
    const batch = await require('../Batch/batch.model').BatchModel.findById(batchId).populate(
        'courseId'
    );

    if (!batch) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Batch not found');
    }

    // Get all modules for the course
    const modules = await ModuleModel.find({ courseId: batch.courseId }).sort({ orderIndex: 1 });

    // Get progress for all modules
    const moduleProgress = await ModuleProgressModel.find({ enrollmentId: enrollment._id });

    // Map progress to modules
    const modulesWithProgress = modules.map((module) => {
        const progress = moduleProgress.find(
            (p) => p.moduleId.toString() === module._id.toString()
        );

        return {
            ...module.toObject(),
            progress: progress
                ? {
                      status: progress.status,
                      completionPercentage: progress.completionPercentage,
                      unlockedAt: progress.unlockedAt,
                      completedAt: progress.completedAt,
                  }
                : {
                      status: ProgressStatus.Locked,
                      completionPercentage: 0,
                  },
        };
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Modules retrieved successfully',
        data: modulesWithProgress,
    });
});

/**
 * Get lessons for a module with progress
 */
const getModuleLessons = catchAsync(async (req: Request, res: Response) => {
    const { batchId, moduleId } = req.params as { batchId: string; moduleId: string };
    const enrollment = (req as any).enrollment;

    // Check if module is unlocked
    const moduleProgress = await ModuleProgressModel.findOne({
        enrollmentId: enrollment._id,
        moduleId,
    });

    if (!moduleProgress || moduleProgress.status === ProgressStatus.Locked) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'This module is locked');
    }

    // Get module progress with lessons
    const result = await ProgressService.getModuleProgress(enrollment._id, moduleId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Lessons retrieved successfully',
        data: result,
    });
});

/**
 * Get lesson details with video URL
 */
const getLessonDetails = catchAsync(async (req: Request, res: Response) => {
    const { batchId, moduleId, lessonId } = req.params;
    const enrollment = (req as any).enrollment;

    // Check module access
    const moduleProgress = await ModuleProgressModel.findOne({
        enrollmentId: enrollment._id,
        moduleId,
    });

    if (!moduleProgress || moduleProgress.status === ProgressStatus.Locked) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'This module is locked');
    }

    // Get lesson
    const lesson = await LessonModel.findById(lessonId).lean();

    if (!lesson || lesson.moduleId.toString() !== moduleId) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found in this module');
    }

    // Get resources for this lesson
    const resources = await ResourceModel.find({ lessonId }).sort({ orderIndex: 1 });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Lesson retrieved successfully',
        data: {
            lesson,
            resources,
        },
    });
});

/**
 * Get module resources
 */
const getModuleResources = catchAsync(async (req: Request, res: Response) => {
    const { batchId, moduleId } = req.params;
    const enrollment = (req as any).enrollment;

    // Check module access
    const moduleProgress = await ModuleProgressModel.findOne({
        enrollmentId: enrollment._id,
        moduleId,
    });

    if (!moduleProgress || moduleProgress.status === ProgressStatus.Locked) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'This module is locked');
    }

    // Get resources
    const resources = await ResourceModel.find({ moduleId }).sort({ orderIndex: 1 });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Resources retrieved successfully',
        data: resources,
    });
});

/**
 * Update lesson progress
 */
const updateLessonProgress = catchAsync(async (req: Request, res: Response) => {
    const { lessonId } = req.params as { lessonId: string };
    const enrollment = (req as any).enrollment;
    const { watchTime, lastWatchedPosition } = req.body;

    const progress = await ProgressService.updateLessonProgress(
        enrollment._id,
        lessonId,
        watchTime,
        lastWatchedPosition
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Progress updated successfully',
        data: progress,
    });
});

/**
 * Get batch overall progress
 */
const getBatchProgress = catchAsync(async (req: Request, res: Response) => {
    const { batchId } = req.params;
    const enrollment = (req as any).enrollment;

    const progress = await ProgressService.getBatchProgress(enrollment._id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Progress retrieved successfully',
        data: progress,
    });
});

export const ContentController = {
    getBatchModules,
    getModuleLessons,
    getLessonDetails,
    getModuleResources,
    updateLessonProgress,
    getBatchProgress,
};
