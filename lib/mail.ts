import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Verify your email address</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${confirmLink}">${confirmLink}</a>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
}

export async function sendConnectionRequestEmail(
  receiverEmail: string,
  receiverName: string,
  requesterName: string,
  requesterEmail: string
) {
  const connectionsLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/researcher/connections`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: receiverEmail,
    subject: `${requesterName} sent you a connection request`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .requester-info {
            display: flex;
            align-items: center;
            margin: 15px 0;
          }
          .avatar {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 20px;
            margin-right: 15px;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 10px 0;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
          .info-text {
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤝 New Connection Request</h1>
        </div>
        <div class="content">
          <p>Hi ${receiverName || 'there'},</p>
          
          <div class="card">
            <p style="margin-top: 0;"><strong>You have a new connection request!</strong></p>
            
            <div class="requester-info">
              <div class="avatar">
                ${requesterName ? requesterName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
              </div>
              <div>
                <div style="font-weight: 600; color: #111827;">${requesterName}</div>
                <div class="info-text">${requesterEmail}</div>
              </div>
            </div>
            
            <p class="info-text">
              ${requesterName} would like to connect with you on CuraLink. 
              Accept this request to start collaborating and chatting.
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${connectionsLink}" class="button">
              View Connection Request
            </a>
          </div>

          <p class="info-text" style="margin-top: 20px;">
            You can accept or reject this request from your Connections page. 
            Once accepted, you'll be able to chat and collaborate together.
          </p>
        </div>

        <div class="footer">
          <p>
            This email was sent by CuraLink<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #667eea;">Visit CuraLink</a>
          </p>
        </div>
      </body>
      </html>
    `,
  });
}
