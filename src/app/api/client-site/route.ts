import { NextResponse } from "next/server";
import { clientSiteRepository } from '../../repository/ClientSiteRepository';

export async function GET() {
  try {
    const clientSites = await clientSiteRepository.getAllClientSites();
    return NextResponse.json(clientSites, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro ao buscar ClientSites." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { clientName, clientUrl, status, keywords} = body;

  if (!clientName || !clientUrl || !status || !keywords) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const newClientSite = await clientSiteRepository.createClientSite({
      clientName,
      clientUrl,
      status,
      keywords,
    });
    return NextResponse.json(newClientSite, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro ao criar Cliente Site." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, clientName, clientUrl, status, keywords } = body;

  if (!id || !clientName || !clientUrl || !status || !keywords) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios, incluindo o ID." },
      { status: 400 }
    );
  }

  try {
    const updatedClientSite = await clientSiteRepository.updateClientSite(id, {
      clientName,
      clientUrl,
      status,
      keywords,
    });

    if (!updatedClientSite) {
      return NextResponse.json(
        { message: "Cliente Site não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedClientSite, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro ao atualizar Cliente Site." }, { status: 500 });
  }
}

