// src/types.ts

import { Status } from "@prisma/client";

export interface ClientSite {
  id: number;
  status: Status;
  clientName: string;
  clientUrl: string;
  keywords: string[];
  numero: string;
  email: string;
  latency?: string;
  responseTime?: string;
}
