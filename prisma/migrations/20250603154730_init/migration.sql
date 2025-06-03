-- CreateTable
CREATE TABLE "SessionHistories" (
    "id" SERIAL NOT NULL,
    "sessionId" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utm_source" TIMESTAMP(3) NOT NULL,
    "utm_medium" VARCHAR(255) NOT NULL,
    "utm_content" TEXT,

    CONSTRAINT "SessionHistories_pkey" PRIMARY KEY ("id")
);
