import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { LessonModel } from './lesson.model';
import { ModuleModel } from '../Module/module.model';
import ApiError from '../../errors/ApiError';

/**
 * Create a new lesson for a module
 */
const createLesson = catchAsync(async (req: Request, res: Response) => {
    const { moduleId } = req.params;
    const lessonData = req.body;

    // Verify module exists
    const module = await ModuleModel.findById(moduleId);
    if (!module) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found');
    }

    // Check if order index exists
    if (lessonData.orderIndex !== undefined) {
        const existingLesson = await LessonModel.findOne({
            moduleId,
            orderIndex: lessonData.orderIndex,
        });

        if (existingLesson) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                'Lesson with this order index already exists'
            );
        }
    } else {
        // Auto-assign order index
        const maxOrder = await LessonModel.findOne({ moduleId }).sort({ orderIndex: -1 });
        lessonData.orderIndex = maxOrder ? maxOrder.orderIndex + 1 : 0;
    }

    const lesson = await LessonModel.create({
        ...lessonData,
        moduleId,
    });

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Lesson created successfully',
        data: lesson,
    });
});

/**
 * Get all lessons for a module
 */
const getModuleLessons = catchAsync(async (req: Request, res: Response) => {
    const { moduleId } = req.params;
    const { type } = req.query;

    const query: any = { moduleId };
    if (type) query.type = type;

    const lessons = await LessonModel.find(query).sort({ orderIndex: 1 });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Lessons retrieved successfully',
        data: lessons,
    });
});

/**
 * Get lesson by ID
 */
const getLessonById = catchAsync(async (req: Request, res: Response) => {
    const { lessonId } = req.params;

    const lesson = await LessonModel.findById(lessonId).populate('moduleId');

    if (!lesson) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found');
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Lesson retrieved successfully',
        data: lesson,
    });
});

/**
 * Update lesson
 */
const updateLesson = catchAsync(async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const updateData = req.body;

    const lesson = await LessonModel.findById(lessonId);

    if (!lesson) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found');
    }

    // Check order index conflict
    if (updateData.orderIndex !== undefined && updateData.orderIndex !== lesson.orderIndex) {
        const existingLesson = await LessonModel.findOne({
            moduleId: lesson.moduleId,
            orderIndex: updateData.orderIndex,
            _id: { $ne: lessonId },
        });

        if (existingLesson) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                'Lesson with this order index already exists'
            );
        }
    }

    Object.assign(lesson, updateData);
    await lesson.save();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Lesson updated successfully',
        data: lesson,
    });
});

/**
 * Delete lesson
 */
const deleteLesson = catchAsync(async (req: Request, res: Response) => {
    const { lessonId } = req.params;

    const lesson = await LessonModel.findById(lessonId);

    if (!lesson) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found');
    }

    await LessonModel.findByIdAndDelete(lessonId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Lesson deleted successfully',
        data: null,
    });
});

/**
 * Reorder lessons in a module
 */
const reorderLessons = catchAsync(async (req: Request, res: Response) => {
    const { moduleId } = req.params;
    const { lessonOrders } = req.body; // Array of { lessonId, orderIndex }

    if (!Array.isArray(lessonOrders)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'lessonOrders must be an array');
    }

    // Update order indexes
    await Promise.all(
        lessonOrders.map(({ lessonId, orderIndex }: any) =>
            LessonModel.findByIdAndUpdate(lessonId, { orderIndex })
        )
    );

    const lessons = await LessonModel.find({ moduleId }).sort({ orderIndex: 1 });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Lessons reordered successfully',
        data: lessons,
    });
});

export const LessonController = {
    createLesson,
    getModuleLessons,
    getLessonById,
    updateLesson,
    deleteLesson,
    reorderLessons,
};
