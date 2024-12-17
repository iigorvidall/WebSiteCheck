import { Status, ClientSite } from '@prisma/client';
import { clientSiteRepository } from '../../repository/ClientSiteRepository';
import { NextResponse } from 'next/server';

const notifyingSites = new Set<string>();

async function pingWithAllOrigins(url: string) {
  const start = Date.now();
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const latency = Date.now() - start;
      const data = await response.json();
      const httpCode = data.status.http_code;
      return {
        status: httpCode === 200 ? Status.ONLINE : Status.OFFLINE,
        latency: `${latency}ms`,
        responseTime: latency,
      };
    }
    throw new Error('Network response was not ok.');
  } catch (_) {
    const latency = Date.now() - start;
    return {
      status: Status.OFFLINE,
      latency: `${latency}ms`,
      responseTime: latency,
    };
  }
}

async function checkAndUpdateSites() {
  try {
    const sites = await clientSiteRepository.getAllClientSites();

    const updatedSites = await Promise.all(
      sites.map(async (site: ClientSite) => {
        const pingResult = await pingWithAllOrigins(site.clientUrl);
        const updatedSite = { ...site, ...pingResult };

        await clientSiteRepository.updateClientSite(site.id, {
          status: updatedSite.status,
          responseTime: updatedSite.responseTime,
        });

        console.log(`Site ${site.clientName} atualizado para ${updatedSite.status} com responseTime de ${updatedSite.responseTime}ms`);

        if (updatedSite.status === Status.OFFLINE && site.status === Status.ONLINE) {
          console.log(`Site ${updatedSite.clientName} mudou para offline. Enviando notificação...`);
          notifyingSites.add(site.id.toString());

          try {
            const notifyResponse = await fetch('http://localhost:3000/api/notify', {
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

    console.log('Atualização completa dos sites:', updatedSites);
  } catch (error) {
    console.error('Erro ao verificar e atualizar sites:', error);
  }
}

export async function GET() {
  try {
    await checkAndUpdateSites();
    return NextResponse.json({ message: 'Sites verificados e atualizados com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro na atualização dos sites:', error);
    return NextResponse.json({ error: 'Erro ao atualizar os sites' }, { status: 500 });
  }
}
