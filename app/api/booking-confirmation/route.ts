import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userEmail, 
      userName, 
      studentName, 
      studentEmail,
      classTitle, 
      classDate, 
      classTime, 
      classPrice,
      bookingId 
    } = body;

    // Validate required fields
    if (!userEmail || !userName || !studentName || !classTitle || !classDate || !classTime || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Format date and time
    const formattedDate = new Date(classDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedTime = new Date(`2000-01-01T${classTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Send email to user (parent/guardian)
    const userEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">¡Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your cooking class reservation is confirmed</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 22px;">Booking Details</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Class Information</h3>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Class:</strong> ${classTitle}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Time:</strong> ${formattedTime}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Price:</strong> $${classPrice}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Booking ID:</strong> ${bookingId}</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Student Information</h3>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Student Name:</strong> ${studentName}</p>
            <p style="margin: 5px 0; color: #4b5563;"><strong>Parent/Guardian:</strong> ${userName}</p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📋 Important Reminders</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Please arrive 10 minutes before the class starts</li>
              <li>Wear comfortable clothes that can get a little messy</li>
              <li>Bring a water bottle for your little chef</li>
              <li>All ingredients and equipment are provided</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Questions? Contact us at <a href="mailto:info@cocinartepdx.com" style="color: #1e3a8a; text-decoration: none;">info@cocinartepdx.com</a> or <a href="tel:+15039169758" style="color: #1e3a8a; text-decoration: none;">+1 (503) 916-9758</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const userMailOptions = {
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: `Booking Confirmed - ${classTitle} on ${formattedDate}`,
      html: userEmailContent,
    };

    // Send email to student (if different email provided)
    let studentMailOptions = null;
    if (studentEmail && studentEmail !== userEmail) {
      const studentEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">¡Hola ${studentName}!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your cooking class is confirmed!</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 22px;">Class Details</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0; color: #4b5563; font-size: 16px;"><strong>Class:</strong> ${classTitle}</p>
              <p style="margin: 5px 0; color: #4b5563; font-size: 16px;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0; color: #4b5563; font-size: 16px;"><strong>Time:</strong> ${formattedTime}</p>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">🎉 What to Expect</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Fun cooking activities designed just for you!</li>
                <li>Learn new recipes and cooking techniques</li>
                <li>Make new friends with other little chefs</li>
                <li>Take home delicious food you made yourself</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                See you soon, little chef! 👨‍🍳👩‍🍳
              </p>
            </div>
          </div>
        </div>
      `;

      studentMailOptions = {
        from: process.env.SMTP_FROM,
        to: studentEmail,
        subject: `Your Cooking Class is Confirmed - ${classTitle}`,
        html: studentEmailContent,
      };
    }

    // Send emails
    const userResult = await transporter.sendMail(userMailOptions);
    console.log('User confirmation email sent:', userResult.messageId);

    let studentResult = null;
    if (studentMailOptions) {
      studentResult = await transporter.sendMail(studentMailOptions);
      console.log('Student confirmation email sent:', studentResult.messageId);
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation emails sent successfully',
      userEmailSent: !!userResult.messageId,
      studentEmailSent: !!studentResult?.messageId
    });

  } catch (error) {
    console.error('Error sending booking confirmation emails:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation emails' },
      { status: 500 }
    );
  }
}
