/*
  Warnings:

  - You are about to drop the column `email` on the `ClientSite` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `ClientSite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClientSite" DROP COLUMN "email",
DROP COLUMN "numero";

-- CreateTable
CREATE TABLE "Administrador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "Administrador"("email");
