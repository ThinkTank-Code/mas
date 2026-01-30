import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ModuleModel } from './module.model';
import { LessonModel } from '../Lesson/lesson.model';
import ApiError from '../../errors/ApiError';

/**
 * Create a new module for a course
 */
const createModule = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const moduleData = req.body;

    // Check if order index exists
    if (moduleData.orderIndex !== undefined) {
        const existingModule = await ModuleModel.findOne({
            courseId,
            orderIndex: moduleData.orderIndex,
        });

        if (existingModule) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                'Module with this order index already exists'
            );
        }
    } else {
        // Auto-assign order index
        const maxOrder = await ModuleModel.findOne({ courseId }).sort({ orderIndex: -1 });
        moduleData.orderIndex = maxOrder ? maxOrder.orderIndex + 1 : 0;
    }

    const module = await ModuleModel.create({
        ...moduleData,
        courseId,
    });

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Module created successfully',
        data: module,
    });
});

/**
 * Get all modules for a course
 */
const getCourseModules = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { status } = req.query;

    const query: any = { courseId };
    if (status) query.status = status;

    const modules = await ModuleModel.find(query).sort({ orderIndex: 1 });

    // Get lesson count for each module
    const modulesWithLessonCount = await Promise.all(
        modules.map(async (module) => {
            const lessonCount = await LessonModel.countDocuments({ moduleId: module._id });
            return {
                ...module.toObject(),
                lessonCount,
            };
        })
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Modules retrieved successfully',
        data: modulesWithLessonCount,
    });
});

/**
 * Get module by ID
 */
const getModuleById = catchAsync(async (req: Request, res: Response) => {
    const { moduleId } = req.params;

    const module = await ModuleModel.findById(moduleId);

    if (!module) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found');
    }

    const lessonCount = await LessonModel.countDocuments({ moduleId: module._id });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Module retrieved successfully',
        data: {
            ...module.toObject(),
            lessonCount,
        },
    });
});

/**
 * Update module
 */
const updateModule = catchAsync(async (req: Request, res: Response) => {
    const { moduleId } = req.params;
    const updateData = req.body;

    const module = await ModuleModel.findById(moduleId);

    if (!module) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found');
    }

    // Check order index conflict
    if (updateData.orderIndex !== undefined && updateData.orderIndex !== module.orderIndex) {
        const existingModule = await ModuleModel.findOne({
            courseId: module.courseId,
            orderIndex: updateData.orderIndex,
            _id: { $ne: moduleId },
        });

        if (existingModule) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                'Module with this order index already exists'
            );
        }
    }

    Object.assign(module, updateData);
    await module.save();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Module updated successfully',
        data: module,
    });
});

/**
 * Delete module
 */
const deleteModule = catchAsync(async (req: Request, res: Response) => {
    const { moduleId } = req.params;

    const module = await ModuleModel.findById(moduleId);

    if (!module) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found');
    }

    // Check if module has lessons
    const lessonCount = await LessonModel.countDocuments({ moduleId });

    if (lessonCount > 0) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Cannot delete module with existing lessons. Delete lessons first.'
        );
    }

    await ModuleModel.findByIdAndDelete(moduleId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Module deleted successfully',
        data: null,
    });
});

/**
 * Reorder modules
 */
const reorderModules = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { moduleOrders } = req.body; // Array of { moduleId, orderIndex }

    if (!Array.isArray(moduleOrders)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'moduleOrders must be an array');
    }

    // Update order indexes
    await Promise.all(
        moduleOrders.map(({ moduleId, orderIndex }: any) =>
            ModuleModel.findByIdAndUpdate(moduleId, { orderIndex })
        )
    );

    const modules = await ModuleModel.find({ courseId }).sort({ orderIndex: 1 });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Modules reordered successfully',
        data: modules,
    });
});

export const ModuleController = {
    createModule,
    getCourseModules,
    getModuleById,
    updateModule,
    deleteModule,
    reorderModules,
};
