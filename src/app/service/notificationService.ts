// import { PrismaClient } from '@prisma/client'; // Importação correta do Prisma
// import { ClientSite } from '../../types/types';
// import prisma from "../lib/prisma"; // Importando a instância do Prisma

// export const sendNotification = async (site: ClientSite) => {
//   console.log("INICIANDO sendNotification para o site:", site.clientName);

//   try {
//     // Verificar campos obrigatórios
//     if (!site.clientName || !site.clientUrl) {
//       console.error('Informações do site estão incompletas:', JSON.stringify(site, null, 2));
//       throw new Error('Informações do site estão incompletas.');
//     }

//     console.log('Informações do site verificadas com sucesso:', JSON.stringify(site, null, 2));

//     // Buscar e-mails dos administradores
//     const administrators = await prisma.administrador.findMany({
//       select: { email: true },
//     });

//     const adminEmails = administrators.map(admin => admin.email);

//     if (adminEmails.length === 0) {
//       console.error('Nenhum e-mail de administrador encontrado.');
//       throw new Error('Nenhum e-mail de administrador encontrado.');
//     }

//     console.log('Tentando enviar e-mail para os administradores:', adminEmails.join(', '));

//     // Enviar e-mails
//     const response = await fetch('/api/send-email', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         emails: adminEmails,
//         subject: 'Aviso: Status do Site Offline',
//         message: `
//         Prezados Administradores,

//         Este é um alerta automático para informar que o status do site de um cliente está OFFLINE. 
//         Aqui estão os detalhes:

//         - Nome do cliente: ${site.clientName}
//         - URL do site: ${site.clientUrl}
//         - Status atual: Offline

//         Por favor, verifiquem o site e tomem as medidas necessárias para resolver o problema.

//         Atenciosamente,  
//         Sistema de Monitoramento
//             `,
//       }),
//     });

//     // Verificar resposta da API
//     if (!response.ok) {
//       console.error('Erro na resposta da API ao enviar e-mail:', response.status, response.statusText);
//       const errorBody = await response.text();
//       console.error('Corpo da resposta de erro:', errorBody);
//       throw new Error(`Falha ao enviar o e-mail. Status: ${response.status}`);
//     }

//     const responseData = await response.json();
//     console.log('Resposta da API:', JSON.stringify(responseData, null, 2));
//     console.log('Notificação enviada com sucesso para os administradores sobre o site:', site.clientName);

//     return true; // Notificação enviada com sucesso
//   } catch (error) {
//     console.error('Erro ao enviar notificação:', error);
//     return false; // Falha ao enviar a notificação
//   } finally {
//     console.log("FINALIZANDO sendNotification para o site:", site.clientName);
//   }
// };
