import nodemailer from "nodemailer";
import { NextResponse as Response } from 'next/server';

async function sendOrderStatusEmail({
  to,
  subject,
  orderStatus,
  orderNumber,
  productsDetails,
}: {
  to: string;
  subject: string;
  orderStatus: string;
  orderNumber: string;
  productsDetails: string;
}) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    logger: true,
    debug: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
               <div style="border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
                   <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
                 <img src="https://vaultsneaks.vercel.app/_next/image?url=%2FVaultSneak_Logo-01.png&w=1080&q=75" 
                 alt="VaultSneak Logo" 
                style="width: 80px; height: auto;" />
            </div>
            <div style="font-size: 20px; font-weight: bold; color: #333;">VaultSneak</div>
            </div>
                    <h2 style="color: #333;">Order Status Update</h2>
                    <p style="color: #555; font-size: 16px;">Your order <strong>${orderNumber}</strong> status has been updated to <strong>${orderStatus}</strong>.</p>
                    <div style="margin: 20px 0;">
                        <h3 style="color: #333;">Product Details</h3>
                        ${productsDetails}
                    </div>
                    <p style="color: #555; font-size: 16px;">Thank you for shopping with us.</p>
                </div>
                <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">
                    &copy; ${new Date().getFullYear()} VaultSneak. All rights reserved.
                </p>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendAccountStatusEmail({
  to,
  subject,
  text,
  fullName,
}: {
  to: string;
  subject: string;
  text: string;
  fullName: string;
}) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    logger: true,
    debug: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <img src="https://vaultsneaks.vercel.app/_next/image?url=%2FVaultSneak_Logo-01.png&w=1080&q=75" alt="VaultSneak Logo" style="width: 80px; height: auto;"/>
          <h2 style="margin-left: 10px; color: #333;">VaultSneak</h2>
        </div>
        <p style="color: #555; font-size: 16px;">Welcome to VaultSneak!</p>
        <h2 style="color: #333;">Account Deactivation!</h2>
        <p style="color: #555; font-size: 16px;">Dear ${fullName}, ${text}</p>
        <p style="color: #555; font-size: 12px;">Contact us for more information.</p>
        <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} VaultSneak. All rights reserved.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendActivationEmail({
  to,
  subject,
  fullName,
}: {
  to: string;
  subject: string;
  fullName: string;
}) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    logger: true,
    debug: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <img src="https://vaultsneaks.vercel.app/_next/image?url=%2FVaultSneak_Logo-01.png&w=1080&q=75" alt="VaultSneak Logo" style="width: 80px; height: auto;"/>
          <h2 style="margin-left: 10px; color: #333;">VaultSneak</h2>
        </div>
        <p style="color: #555; font-size: 16px;">Welcome to VaultSneak!</p>
        <h2 style="color: #333;">Account Activation</h2>
        <p style="color: #555; font-size: 16px;">Dear ${fullName}, your account has been activated successfully. Congratulations!</p>
        <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} VaultSneak. All rights reserved.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(req: any) {
  try {
    const {
      to,
      subject,
      text,
      userId,
      isActivationSuccess,
      fullName,
      orderStatus,
      orderNumber,
      productsDetails,
    } = await req.json();
    const missingFields: string[] = [];

    if (!to) missingFields.push("to");

    if (orderStatus) {
      if (!orderNumber) missingFields.push("orderNumber");
      if (!subject) missingFields.push("subject");
      if (!productsDetails) missingFields.push("productsDetails");
    } else if (typeof isActivationSuccess === "boolean" && isActivationSuccess) {
      if (!subject) missingFields.push("subject");
      if (!fullName) missingFields.push("fullName");
    } else {
      if (!subject) missingFields.push("subject");
      if (!text) missingFields.push("text");
      if (!userId) missingFields.push("userId");
      if (!fullName) missingFields.push("fullName");
    }

    if (missingFields.length) {
      console.log("Missing fields:", missingFields.join(", "));
      return Response.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (orderStatus) {
      await sendOrderStatusEmail({
        to,
        subject,
        orderStatus,
        orderNumber,
        productsDetails,
      });
    } else if (typeof isActivationSuccess === "boolean" && isActivationSuccess) {
      await sendActivationEmail({
        to,
        subject,
        fullName,
      });
    } else {
      await sendAccountStatusEmail({
        to,
        subject,
        text,
        fullName,
      });
    }

    return Response.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email Error:", error);
    return Response.json(
      { message: "Error sending email", error },
      { status: 500 }
    );
  }
}
