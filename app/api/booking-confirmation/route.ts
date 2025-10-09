import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userEmail, 
      userName, 
      studentName,
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
    const transporter = nodemailer.createTransport({
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

    // Admin notification email
    const adminEmailContent = `
      <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FEFEFE;">
        <div style="background: linear-gradient(135deg, #00ADEE 0%, #F0614F 100%); color: white; padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">🎉 New Booking Received!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">A new cooking class has been booked</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 3px solid #F48E77; border-top: none; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #F0614F; margin: 0 0 20px 0; font-size: 24px; border-bottom: 3px solid #FCB414; padding-bottom: 10px;">Booking Details</h2>
          
          <div style="background: #CDECF9; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #00ADEE;">
            <h3 style="color: #F0614F; margin: 0 0 15px 0; font-size: 20px;">🍳 Class Information</h3>
            <p style="margin: 8px 0; color: #333; font-size: 15px;"><strong style="color: #00ADEE;">Class:</strong> ${classTitle}</p>
            <p style="margin: 8px 0; color: #333; font-size: 15px;"><strong style="color: #00ADEE;">Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #333; font-size: 15px;"><strong style="color: #00ADEE;">Time:</strong> ${formattedTime}</p>
            <p style="margin: 8px 0; color: #333; font-size: 15px;"><strong style="color: #00ADEE;">Price:</strong> $${classPrice}</p>
            <p style="margin: 8px 0; color: #333; font-size: 15px;"><strong style="color: #00ADEE;">Booking ID:</strong> ${bookingId}</p>
          </div>

          <div style="background: #FFF5E6; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #FCB414;">
            <h3 style="color: #F0614F; margin: 0 0 15px 0; font-size: 20px;">👨‍👩‍👧 Customer Information</h3>
            <p style="margin: 8px 0; color: #333; font-size: 15px;"><strong style="color: #00ADEE;">Parent/Guardian:</strong> ${userName}</p>
            <p style="margin: 8px 0; color: #333; font-size: 15px;"><strong style="color: #00ADEE;">Email:</strong> <a href="mailto:${userEmail}" style="color: #F0614F; text-decoration: none;">${userEmail}</a></p>
            <p style="margin: 8px 0; color: #333; font-size: 15px;"><strong style="color: #00ADEE;">Student Name:</strong> ${studentName}</p>
          </div>

          <div style="background: linear-gradient(135deg, #FCB414 0%, #F48E77 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 3px 5px rgba(0,0,0,0.15);">
            <h4 style="color: white; margin: 0 0 10px 0; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">📝 Action Required</h4>
            <p style="color: white; margin: 0; font-size: 15px;">Please prepare materials and confirm class setup for this booking.</p>
          </div>
        </div>
      </div>
    `;

    const adminMailOptions = {
      from: process.env.SMTP_FROM,
      to: 'diego@comcreate.org',
      subject: `New Booking: ${classTitle} - ${formattedDate}`,
      html: adminEmailContent,
    };

    // User confirmation email
    const userEmailContent = `
      <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FEFEFE;">
        <div style="background: linear-gradient(135deg, #F0614F 0%, #F48E77 50%, #FCB414 100%); color: white; padding: 35px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; font-size: 36px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">¡Booking Confirmed!</h1>
          <p style="margin: 12px 0 0 0; font-size: 18px; opacity: 0.95;">Your cooking class reservation is confirmed 🎉</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 3px solid #F48E77; border-top: none; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #F0614F; margin: 0 0 25px 0; font-size: 26px; border-bottom: 3px solid #FCB414; padding-bottom: 10px;">Your Booking Details</h2>
          
          <div style="background: #CDECF9; padding: 22px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #00ADEE;">
            <h3 style="color: #F0614F; margin: 0 0 15px 0; font-size: 20px;">🍳 Class Information</h3>
            <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong style="color: #00ADEE;">Class:</strong> ${classTitle}</p>
            <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong style="color: #00ADEE;">Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong style="color: #00ADEE;">Time:</strong> ${formattedTime}</p>
            <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong style="color: #00ADEE;">Price:</strong> $${classPrice}</p>
            <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong style="color: #00ADEE;">Booking ID:</strong> ${bookingId}</p>
          </div>

          <div style="background: #FFF5E6; padding: 22px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #FCB414;">
            <h3 style="color: #F0614F; margin: 0 0 15px 0; font-size: 20px;">👨‍🍳 Student Information</h3>
            <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong style="color: #00ADEE;">Student Name:</strong> ${studentName}</p>
            <p style="margin: 8px 0; color: #333; font-size: 16px;"><strong style="color: #00ADEE;">Parent/Guardian:</strong> ${userName}</p>
          </div>

          <div style="background: linear-gradient(135deg, #FCB414 0%, #F48E77 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 3px 5px rgba(0,0,0,0.15);">
            <h4 style="color: white; margin: 0 0 12px 0; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">📋 Important Reminders</h4>
            <ul style="color: white; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Please arrive 10 minutes before the class starts</li>
              <li style="margin-bottom: 8px;">Wear comfortable clothes that can get a little messy</li>
              <li style="margin-bottom: 8px;">Bring a water bottle for your little chef</li>
              <li>All ingredients and equipment are provided</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #CDECF9; border-radius: 12px;">
            <p style="color: #333; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">Questions? We're here to help!</p>
            <p style="color: #333; margin: 0; font-size: 15px;">
              📧 <a href="mailto:info@cocinartepdx.com" style="color: #F0614F; text-decoration: none; font-weight: bold;">info@cocinartepdx.com</a>
              <br>
              📞 <a href="tel:+15039169758" style="color: #F0614F; text-decoration: none; font-weight: bold;">+1 (503) 916-9758</a>
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

    // Send both emails
    const adminResult = await transporter.sendMail(adminMailOptions);
    console.log('Admin notification email sent:', adminResult.messageId);

    const userResult = await transporter.sendMail(userMailOptions);
    console.log('User confirmation email sent:', userResult.messageId);

    return NextResponse.json({
      success: true,
      message: 'Confirmation emails sent successfully',
      adminEmailSent: !!adminResult.messageId,
      userEmailSent: !!userResult.messageId
    });

  } catch (error) {
    console.error('Error sending booking confirmation emails:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation emails' },
      { status: 500 }
    );
  }
}
