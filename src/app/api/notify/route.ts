import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import nodemailer from 'nodemailer';

// Função para enviar notificações por e-mail
async function sendEmailNotification(clientName: string, clientUrl: string, adminEmails: string[]) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmails.join(', '),
    subject: `Notificação: O site ${clientName} está OFFLINE`,
    html: `
      <p>Prezado Administrador,</p>
      <p>O site ${clientName} (${clientUrl}) está OFFLINE.</p>
      <p>Por favor, verifique e tome as providências necessárias.</p>
      <p>Atenciosamente,</p>
      <p>Sua equipe de monitoramento.</p>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, clientUrl } = body;

    if (!clientName || !clientUrl) {
      return NextResponse.json({ error: 'Missing client information' }, { status: 400 });
    }

    const administrators = await prisma.administrador.findMany({
      select: { email: true },
    });

    const adminEmails = administrators.map((admin) => admin.email);

    if (adminEmails.length === 0) {
      return NextResponse.json({ error: 'No administrator emails found' }, { status: 500 });
    }

    await sendEmailNotification(clientName, clientUrl, adminEmails);

    return NextResponse.json({ success: true, message: 'E-mail enviado com sucesso' });
  } catch (error) {
    console.error('Error sending email notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
