# 🌐 WebsiteCheck

**WebsiteCheck** é um projeto colaborativo que oferece uma solução prática, robusta e inteligente para o monitoramento de sites. Combinando automações via n8n, inteligência artificial (IA) e um painel frontend moderno, o sistema permite acompanhar em tempo real se sites estão online ou offline — com alertas automáticos e diagnósticos explicativos sempre que algo dá errado.

## 👥 Sobre o projeto

Desenvolvido em parceria com [Hugo Vidal](https://github.com/iigorvidall), o projeto foi dividido da seguinte forma:

- **Igor Vidal** – responsável pelas automações e diagnósticos com IA:
  - Criação de fluxos no **n8n** para orquestrar as verificações periódicas nos sites
  - Utilização da API da **OpenAI (GPT)** para interpretar erros e gerar mensagens de alerta por e-mail com explicações e sugestões de solução

- **Hugo Vidal** – responsável pelo frontend e backend do painel:
  - Tecnologias: **Next.js**, **PostgreSQL**, **Prisma** e **shadcn/ui**

## ⚙️ Como funciona

As URLs podem ser cadastradas de três formas:
- Diretamente no painel web (hospedado via Railway)
- Através de uma planilha Google (entrada em massa)
- Importação automatizada de um banco de dados

Após o cadastro, os sites são periodicamente verificados. As mudanças de status (online/offline) são atualizadas em tempo real e refletidas automaticamente no painel de visualização.

## ✨ Funcionalidades principais

- Visualização em tempo real dos sites monitorados
- Filtro por status e busca por nome
- Cadastro de administradores
- Alertas automáticos por e-mail quando um site está OFF
- Diagnóstico com IA: identifica o erro (ex: 404, 504), explica o motivo e sugere uma solução

## 💡 Tecnologias utilizadas

- **Frontend e Backend**:  
  - Next.js + Prisma + PostgreSQL  
  - UI com shadcn/ui

- **Automação + IA**:
  - n8n para orquestração dos fluxos
  - OpenAI GPT para interpretação de erros e diagnóstico inteligente

Feito por [Igor Vidal](https://github.com/iigorvidall) e [Hugo Vidal](https://github.com/VidalsHugo)
