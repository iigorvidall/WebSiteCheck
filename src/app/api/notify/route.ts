import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import nodemailer from 'nodemailer';

// Configura o transportador para o servidor de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail', // Altere conforme o provedor de e-mail
  auth: {
    user: process.env.EMAIL_USER, // Coloque o e-mail de remetente no .env
    pass: process.env.EMAIL_PASSWORD, // Coloque a senha do e-mail de remetente no .env
  },
});

export async function POST(req: NextRequest) {
  try {
    const { site } = await req.json();

    if (!site || !site.clientName || !site.clientUrl) {
      return NextResponse.json({ error: 'Missing site information' }, { status: 400 });
    }

    console.log('Processing notification for site:', site.clientName);

    // Buscando os emails dos administradores
    const administrators = await prisma.administrador.findMany({
      select: { email: true },
    });

    const adminEmails = administrators.map(admin => admin.email);

    if (adminEmails.length === 0) {
      return NextResponse.json({ error: 'No administrator emails found' }, { status: 500 });
    }

    console.log('Notifying admins:', adminEmails);

    // Configura o conteúdo do e-mail
    const subject = `Notificação: O site ${site.clientName} está OFFLINE`;
    const message = `
      <p>Prezado Administrador,</p><br><br>
      <p>O site ${site.clientName} (${site.clientUrl}) está OFFLINE.</p><br><br>
      <p>Por favor, verifique e tome as providências necessárias.</p><br>
      <p>Atenciosamente,</p>
      <p>Sua equipe de monitoramento.</p>
    `;

    // Envia o e-mail para os administradores
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmails.join(', '),
      subject: subject,
      html: message,
    };

    const emailResponse = await transporter.sendMail(mailOptions);

    console.log('Resposta do Nodemailer:', emailResponse);

    return NextResponse.json({ success: true, message: 'E-mail enviado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
