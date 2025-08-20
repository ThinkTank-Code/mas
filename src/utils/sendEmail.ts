import nodemailer from "nodemailer";
import env from "../config/env";
import { Status } from "../types/common";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
    }
});

export const sendPaymentEmail = async (
    to: string,
    type: "success" | "review" | "failed",
    studentData?: {
        name: string,
        email: string,
        studentId: string,
        status: Status,
        amount: number
    },
    tranId?: string
) => {
    let subject = "";
    let html = "";

    const courseInfo = {
        name: "Complete Graphics Design With Freelancing (Batch-05)",
        description: "A comprehensive course covering graphic design principles, industry-standard tools, and freelancing strategies to build a successful career."
    };

    const baseTemplate = (content: string, includeDetails: boolean = false, includeGroups: boolean = false) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    background: #007bff;
                    color: #fff;
                    padding: 15px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                .content {
                    padding: 20px;
                }
                .content p {
                    margin: 10px 0;
                }
                .details {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                }
                .details p {
                    margin: 5px 0;
                }
                .footer {
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    padding: 10px;
                    border-top: 1px solid #eee;
                }
                .footer a {
                    color: #007bff;
                    text-decoration: none;
                }
                .footer a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Misun Academy</h1>
                </div>
                <div class="content">
                    <p>Dear ${studentData?.name || 'Student'},</p>
                    <p>Course: <strong>${courseInfo.name}</strong></p>
                    <p>${courseInfo.description}</p>
                    ${content}
                    ${includeDetails && studentData ? `
                    <div class="details">
                        <h3>Payment Details</h3>
                        <p><strong>Name:</strong> ${studentData.name}</p>
                        <p><strong>Email:</strong> ${studentData.email}</p>
                        <p><strong>Student ID:</strong> ${studentData.studentId}</p>
                        <p><strong>Amount:</strong> ${studentData.amount}(BDT)</p>
                        <p><strong>Status:</strong> ${studentData.status}</p>
                        ${tranId ? `<p><strong>Transaction ID:</strong> ${tranId}</p>` : ''}
                        ${includeGroups ? `
                        <p>Please join our community groups for course updates, resources, and further communication:</p>
                        <p><a href="https://www.facebook.com/groups/1279296120606787">Join our Facebook Group</a></p>
                        <p><a href="https://chat.whatsapp.com/CygL5sIowiBFPlutW3iNgl">Join our WhatsApp Group</a></p>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>
                <div class="footer">
                    <p>Thank you for choosing Misun Academy!</p>
                    <p><a href="https://www.misun-academy.com">Visit our website</a></p>
                    <p>Contact us at <a href="mailto:support@misun-academy.com">support@misun-academy.com</a> for any questions.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    switch (type) {
        case "success":
            subject = "Payment Confirmation for Complete Graphics Design With Freelancing (Batch-05)";
            html = baseTemplate(`
                <p>Your payment for the ${courseInfo.name} course has been successfully processed.</p>
                <p>You are now officially enrolled in the course. We are excited to have you join our learning community!</p>
                <p>Please join the course community groups listed below to stay updated, access course resources, and connect with instructors and fellow students for further communication.</p>
            `, true, true);
            break;

        case "review":
            subject = "Payment Under Review for Complete Graphics Design With Freelancing (Batch-05)";
            html = baseTemplate(`
                <p>Your payment for the ${courseInfo.name} course is currently under review for verification.</p>
                <p>We will notify you once the payment has been cleared and your enrollment is confirmed.</p>
                ${tranId ? `<p><strong>Transaction ID:</strong> ${tranId}</p>` : ''}
            `, false, false);
            break;

        case "failed":
            subject = "Payment Failure for Complete Graphics Design With Freelancing (Batch-05)";
            html = baseTemplate(`
                <p>We regret to inform you that your payment for the ${courseInfo.name} course could not be processed.</p>
                <p>This issue may have occurred due to incorrect payment details, insufficient funds, or a technical error with the payment gateway.</p>
                <p>Please verify your payment information and try again. If the issue persists, contact our support team at <a href="mailto:support@misun-academy.com">support@misun-academy.com</a> for assistance.</p>
                ${tranId ? `<p><strong>Transaction ID:</strong> ${tranId}</p>` : ''}
            `, false, false);
            break;
    }

    try {
        await transporter.sendMail({
            from: `"Misun Academy" <no-reply@misun-academy.com>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent successfully to ${to} for ${type} status`);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
};