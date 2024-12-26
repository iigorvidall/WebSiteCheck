import { Status, ClientSite } from '@prisma/client';
import { clientSiteRepository } from '../../repository/ClientSiteRepository';
import { NextResponse } from 'next/server';

// Mutex para evitar notificações duplicadas
const notifyingSites = new Set<string>();

// Função de ping com All Origins
async function pingWithAllOrigins(url: string) {
  const start = Date.now();
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const latency = Date.now() - start; // Calculando o tempo de resposta
      const data = await response.json();
      const httpCode = data.status.http_code;
      return {
        status: httpCode === 200 ? Status.ONLINE : Status.OFFLINE,
        latency: `${latency}ms`, // Tempo de resposta em milissegundos
        responseTime: latency,  // Para ser salvo no banco de dados
      };
    }
    throw new Error('Network response was not ok.');
  } catch (error) {
    const latency = Date.now() - start;
    return {
      status: Status.OFFLINE,
      latency: `${latency}ms`,
      responseTime: latency, // Também salvar a latência mesmo em caso de falha
    };
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

      console.log(`Pinging batch: ${index + 1} to ${index + batch.length}`);

      // Faz ping para os sites do lote atual
      const updatedBatch = await Promise.all(
        batch.map(async (site: ClientSite) => {
          const pingResult = await pingWithAllOrigins(site.clientUrl);
          let updatedSite = { ...site, ...pingResult };

          // Atualiza o banco de dados
          await clientSiteRepository.updateClientSite(site.id, {
            status: updatedSite.status,
            responseTime: updatedSite.responseTime,
          });

          console.log(`Site ${site.clientName} atualizado para ${updatedSite.status} com responseTime de ${updatedSite.responseTime}ms`);

          // Lógica de notificação permanece inalterada
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
  const interval = 3000; // Intervalo entre lotes em milissegundos (10 segundos)

  try {
    await checkAndUpdateSitesInBatches(batchSize, interval);
    return NextResponse.json({ message: 'Sites verificados e atualizados com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro na atualização dos sites:', error);
    return NextResponse.json({ error: 'Erro ao atualizar os sites' }, { status: 500 });
  }
}
