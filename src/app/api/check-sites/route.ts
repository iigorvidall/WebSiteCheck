import { Status, ClientSite } from '@prisma/client';
import { clientSiteRepository } from '../../repository/ClientSiteRepository';
import { NextResponse } from 'next/server';
import axios from 'axios';

const APIFY_API_KEY = 'apify_api_TqYQdxV2BslVHqNWLtd8xRhKALnyCr3mO4Vb';  // Substitua pela sua chave de API
const ACTOR_ID = 'ID_DO_SEU_ACTOR';  // Substitua pelo ID do seu Actor no Apify
const notifyingSites = new Set<string>();

// Função para verificar se a URL está online via Apify Task
// Função para verificar se a URL está online via Apify Task
async function pingWithApify(url: string) {
  const start = Date.now();
  
  try {
    // Chama a Task no Apify com a URL
    const response = await axios.post(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/tasks`,
      { input: { url } },  // Envia a URL como input para a Task
      {
        headers: {
          Authorization: `Bearer ${APIFY_API_KEY}`,
        },
      }
    );

    const taskId = response.data.data.id;  // ID da Task criada no Apify
    const taskStatus = await checkTaskStatus(taskId);  // Verifica o status da Task

    const latency = Date.now() - start; // Calculando o tempo de resposta

    return {
      status: taskStatus === 'SUCCEEDED' ? Status.ONLINE : Status.OFFLINE, // Se a Task foi bem-sucedida, o site está online
      latency: `${latency}ms`, // Tempo de resposta
      responseTime: latency,  // Tempo de resposta para ser salvo no banco
    };
  } catch (error) {
    const latency = Date.now() - start;
    console.error('Erro ao verificar status via Apify:', error);
    return {
      status: Status.OFFLINE,
      latency: `${latency}ms`,
      responseTime: latency,
    };
  }
}


// Função para verificar o status da Task após ser executada
async function checkTaskStatus(taskId: string) {
  try {
    const response = await axios.get(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${APIFY_API_KEY}`,
        },
      }
    );

    return response.data.data.status; // Retorna o status da Task (SUCCEEDED, FAILED, etc.)
  } catch (error) {
    console.error('Erro ao verificar o status da Task:', error);
    return 'FAILED';  // Se não conseguir verificar o status, retornará FAILED
  }
}

// Função principal que processa sites em lotes
async function checkAndUpdateSitesInBatches(batchSize: number, interval: number) {
  try {
    const sites = await clientSiteRepository.getAllClientSites();
    let index = 0;

    while (index < sites.length) {
      // Divide os sites em lotes
      const batch = sites.slice(index, index + batchSize);

      console.log(`Pinging batch: ${index + 1} a ${index + batch.length}`);

      // Faz ping para os sites do lote atual
      const updatedBatch = await Promise.all(
        batch.map(async (site: ClientSite) => {
          const pingResult = await pingWithApify(site.clientUrl); // Usando a função para fazer o ping via Apify
          let updatedSite = { ...site, ...pingResult };

          // Atualiza o banco de dados
          await clientSiteRepository.updateClientSite(site.id, {
            status: updatedSite.status,
            responseTime: updatedSite.responseTime,
          });

          console.log(`Site ${site.clientName} atualizado para ${updatedSite.status} com responseTime de ${updatedSite.responseTime}ms`);

          // Lógica de notificação
          if (updatedSite.status === Status.OFFLINE && site.status === Status.ONLINE) {
            console.log(`Site ${updatedSite.clientName} mudou para offline. Enviando notificação...`);
            notifyingSites.add(site.id.toString());

            try {
              const notifyResponse = await fetch('http://localhost:8080/api/notify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  clientName: updatedSite.clientName,
                  clientUrl: updatedSite.clientUrl,
                }),
              });

              if (notifyResponse.ok) {
                console.log(`Notificação enviada para ${updatedSite.clientName}`);
                updatedSite.emailEnvied = true;
                await clientSiteRepository.updateClientSite(site.id, { emailEnvied: true });
              } else {
                console.error(`Falha ao enviar notificação para ${updatedSite.clientName}`);
              }
            } catch (error) {
              console.error(`Erro na requisição para enviar notificação para ${updatedSite.clientName}:`, error);
            } finally {
              notifyingSites.delete(site.id.toString());
            }
          } else if (
            updatedSite.status === Status.ONLINE &&
            site.status === Status.OFFLINE &&
            site.emailEnvied
          ) {
            console.log(`Site ${updatedSite.clientName} voltou para online. Resetando flag de notificação...`);
            updatedSite.emailEnvied = false;
            await clientSiteRepository.updateClientSite(site.id, { emailEnvied: false });
          }

          return updatedSite;
        })
      );

      console.log(`Lote ${index + 1} a ${index + batch.length} processado com sucesso.`);
      index += batchSize;

      // Aguarda antes de processar o próximo lote
      if (index < sites.length) {
        console.log(`Aguardando ${interval / 1000} segundos antes de continuar com o próximo lote...`);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    console.log('Todos os sites foram processados.');
  } catch (error) {
    console.error('Erro ao processar sites em lotes:', error);
  }
}

// Handler para a rota
export async function GET() {
  const batchSize = 30; // Número de sites por lote
  const interval = 3000; // Intervalo entre lotes em milissegundos (3 segundos)

  try {
    await checkAndUpdateSitesInBatches(batchSize, interval);
    return NextResponse.json({ message: 'Sites verificados e atualizados com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro na atualização dos sites:', error);
    return NextResponse.json({ error: 'Erro ao atualizar os sites' }, { status: 500 });
  }
}
