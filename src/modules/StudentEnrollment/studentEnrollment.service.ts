import { PipelineStage, Types } from "mongoose";
import { EnrolledStudentModel } from "./studentEnrollment";

interface GetEnrolledStudentQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    batchId?: string;
    studentId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

const getEnrolledStudents = async (query: GetEnrolledStudentQuery) => {
    const {
        page = 1,
        limit = 10,
        search,
        status,
        batchId,
        studentId,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    const filters: Record<string, any> = {};

    if (status) filters.status = status;
    if (batchId) filters.batch = new Types.ObjectId(batchId);
    if (studentId) filters.studentId = studentId;

    const pipeline: PipelineStage[] = [
        { $match: filters },
        {
            $lookup: {
                from: "students",
                localField: "student",
                foreignField: "_id",
                as: "student",
            },
        },
        { $unwind: "$student" },
        {
            $lookup: {
                from: "batches",
                localField: "batch",
                foreignField: "_id",
                as: "batch",
            },
        },
        { $unwind: "$batch" },
    ];

    // Search by student name or studentId
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { "student.name": { $regex: search, $options: "i" } },
                    { studentId: { $regex: search, $options: "i" } },
                ],
            },
        });
    }

    // Sorting
    pipeline.push({
        $sort: {
            [sortBy]: sortOrder === "asc" ? 1 : -1,
        },
    });

    // Pagination
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    // Project fields
    pipeline.push({
        $project: {
            _id: 1,
            studentId: 1,
            status: 1,
            createdAt: 1,
            "student._id": 1,
            "student.name": 1,
            "student.email": 1,
            "batch._id": 1,
            "batch.title": 1,
        },
    });

    const data = await EnrolledStudentModel.aggregate(pipeline);

    // Total count for pagination
    const totalDocuments = await EnrolledStudentModel.countDocuments(filters);

    return {
        meta: {
            total: totalDocuments,
            page,
            limit,
            totalPages: Math.ceil(totalDocuments / limit),
        },
        data,
    };
};


export const EnrolledStudentService = {
    getEnrolledStudents
}
