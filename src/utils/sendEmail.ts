import nodemailer from "nodemailer";
import env from "../config/env";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   // For Gmail SMTP
    port: 465,                // 465 = secure, 587 = insecure (STARTTLS)
    secure: true,             // true for port 465, false for port 587
    auth: {
        user: env.EMAIL_USER, // your email
        pass: env.EMAIL_PASS  // your app password (not raw email password)
    }
});


export const sendPaymentEmail = async (
    to: string,
    type: "success" | "review" | "failed",
    tranId: string
) => {
    let subject = "";
    let html = "";

    switch (type) {
        case "success":
            subject = "Payment Successful 🎉";
            html = `
                <h2>Dear Student,</h2>
                <p>Your payment has been successfully verified. Welcome to the course!</p>
                <p><b>Transaction ID:</b> ${tranId}</p>
            `;
            break;

        case "review":
            subject = "Payment Under Review ⏳";
            html = `
                <h2>Dear Student,</h2>
                <p>Your payment is currently under review for verification. We will notify you once it’s cleared.</p>
                <p><b>Transaction ID:</b> ${tranId}</p>
            `;
            break;

        case "failed":
            subject = "Payment Failed ❌";
            html = `
                <h2>Dear Student,</h2>
                <p>Unfortunately, your payment could not be processed. Please try again or contact support.</p>
                <p><b>Transaction ID:</b> ${tranId}</p>
            `;
            break;
    }

    try {
        await transporter.sendMail({
            from: `"Misun Academy" <no-reply@misun-academy.com>`,
            to,
            subject,
            html,
        });
        console.log(`✅ Email sent to ${to} (${type})`);
    } catch (error) {
        console.error("❌ Email send failed:", error);
    }
};
