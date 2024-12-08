// import { NextResponse } from "next/server";
// import nodemailer from "nodemailer";

// // Configura o transportador para o servidor de e-mail
// const transporter = nodemailer.createTransport({
//   service: "gmail", // Alterar conforme o provedor de e-mail
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// export async function POST(request: Request) {
//   console.log("Requisição recebida para enviar e-mail");

//   const { emails, subject, message } = await request.json();
//   console.log('Dados recebidos:', { emails, subject, message });

//   const senderEmail = process.env.EMAIL_USER;

//   if (!senderEmail) {
//     console.error("E-mail de remetente não configurado");
//     return NextResponse.json(
//       { message: "O e-mail de remetente não está configurado." },
//       { status: 400 }
//     );
//   }

//   if (!emails || !Array.isArray(emails) || emails.length === 0) {
//     console.error("Lista de e-mails de destinatários não fornecida ou inválida");
//     return NextResponse.json(
//       { message: "A lista de e-mails de destinatários é inválida ou não foi fornecida." },
//       { status: 400 }
//     );
//   }

//   try {
//     console.log('Enviando e-mail para:', emails.join(', '));

//     const mailOptions = {
//       from: senderEmail,
//       to: emails.join(', '),
//       subject: subject,
//       html: message,
//     };

//     const emailResponse = await transporter.sendMail(mailOptions);

//     console.log('Resposta do Nodemailer:', emailResponse);

//     return NextResponse.json({
//       message: "E-mail enviado com sucesso!",
//       data: emailResponse,
//     });

//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Erro ao enviar e-mail:", error.message);
//       return NextResponse.json(
//         { message: "Falha ao enviar o e-mail", error: error.message },
//         { status: 500 }
//       );
//     } else {
//       console.error("Erro desconhecido:", error);
//       return NextResponse.json(
//         { message: "Falha ao enviar o e-mail", error: "Erro desconhecido" },
//         { status: 500 }
//       );
//     }
//   }
// }
