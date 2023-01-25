-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "remote_jid" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false
);
