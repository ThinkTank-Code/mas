import { EnrolledStudentModel } from "../StudentEnrollment/studentEnrollment";
import { PaymentModel } from "../Payment/payment.model";

const getDashboardMetaData = async () => {
    const now = new Date();
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // 1. Total enrolled students (payment success & enroll status success)
    const totalEnrolledPromise = EnrolledStudentModel.countDocuments({
        status: "success",
    }).populate({
        path: "payment",
        match: { status: "success" },
    });

    // 2. Batch-wise total enrolled students
    const batchWiseEnrolledPromise = EnrolledStudentModel.aggregate([
        { $match: { status: "success" } },
        {
            $lookup: {
                from: "payments",
                localField: "payment",
                foreignField: "_id",
                as: "payment",
            },
        },
        { $unwind: "$payment" },
        { $match: { "payment.status": "success" } },
        {
            $group: {
                _id: "$batch",
                totalEnrolled: { $sum: 1 },
            },
        },
    ]);

    // 3. Total income (last 60 days, successful payments)
    const totalIncomePromise = PaymentModel.aggregate([
        { $match: { status: "success", createdAt: { $gte: sixtyDaysAgo } } },
        { $group: { _id: null, totalIncome: { $sum: "$amount" } } },
    ]);

    // 4. Day-wise income & enrollment stats (last 60 days)
    const dayWiseStatsPromise = PaymentModel.aggregate([
        { $match: { status: "success", createdAt: { $gte: sixtyDaysAgo } } },
        {
            $lookup: {
                from: "enrolledstudents",
                localField: "_id",
                foreignField: "payment",
                as: "enrollment",
            },
        },
        { $unwind: "$enrollment" },
        { $match: { "enrollment.status": "success" } },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                totalIncome: { $sum: "$amount" },
                totalEnrollment: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const [totalEnrolled, batchWiseEnrolled, totalIncomeResult, dayWiseStats] =
        await Promise.all([
            totalEnrolledPromise,
            batchWiseEnrolledPromise,
            totalIncomePromise,
            dayWiseStatsPromise,
        ]);

    return {
        totalEnrolled: totalEnrolled,
        batchWiseEnrolled: batchWiseEnrolled.map((b) => ({
            batchId: b._id,
            totalEnrolled: b.totalEnrolled,
        })),
        totalIncome: totalIncomeResult[0]?.totalIncome || 0,
        dayWiseStats: dayWiseStats.map((d) => ({
            date: d._id,
            totalIncome: d.totalIncome,
            totalEnrollment: d.totalEnrollment,
        })),
    };
};


export const DashboardService = {
    getDashboardMetaData
}