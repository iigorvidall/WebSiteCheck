-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateTable
CREATE TABLE "ClientSite" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientUrl" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientSite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientSite_clientUrl_key" ON "ClientSite"("clientUrl");
