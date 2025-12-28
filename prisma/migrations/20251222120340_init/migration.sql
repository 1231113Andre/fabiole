-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "surname" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "birth" DATE NOT NULL,
    "trainingCredit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "trainingsScheduled" INTEGER NOT NULL DEFAULT 0,
    "debtValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid" VARCHAR(10) NOT NULL DEFAULT '-',
    "q1" TEXT,
    "q2" TEXT,
    "q3" TEXT,
    "q4" TEXT,
    "goals" TEXT,
    "notes" TEXT,
    "gender" VARCHAR(20),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesagens" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "peso" DECIMAL(5,2),
    "percentualMG" DECIMAL(5,2),
    "mm" DECIMAL(5,2),
    "h2o" DECIMAL(5,2),
    "imc" DECIMAL(5,2),
    "gordVisceral" DECIMAL(5,2),
    "idMetabolica" DECIMAL(5,2),
    "massaOssea" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "resultadoIMC" VARCHAR(50),
    "resultadoPercentMG" VARCHAR(50),
    "notas" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pesagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perimetros" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "msRight" DECIMAL(5,2),
    "msRightFlex" DECIMAL(5,2),
    "msLeft" DECIMAL(5,2),
    "msLeftFlex" DECIMAL(5,2),
    "chest" DECIMAL(5,2),
    "waist" DECIMAL(5,2),
    "abdomen" DECIMAL(5,2),
    "hips" DECIMAL(5,2),
    "thighR" DECIMAL(5,2),
    "thighL" DECIMAL(5,2),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perimetros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "pushUps" INTEGER,
    "sitUps" INTEGER,
    "mile" VARCHAR(20),
    "mileResult" VARCHAR(50),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "pesagens_userId_idx" ON "pesagens"("userId");

-- CreateIndex
CREATE INDEX "pesagens_userId_date_idx" ON "pesagens"("userId", "date");

-- CreateIndex
CREATE INDEX "perimetros_userId_idx" ON "perimetros"("userId");

-- CreateIndex
CREATE INDEX "perimetros_userId_date_idx" ON "perimetros"("userId", "date");

-- CreateIndex
CREATE INDEX "avaliacoes_userId_idx" ON "avaliacoes"("userId");

-- CreateIndex
CREATE INDEX "avaliacoes_userId_date_idx" ON "avaliacoes"("userId", "date");

-- AddForeignKey
ALTER TABLE "pesagens" ADD CONSTRAINT "pesagens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perimetros" ADD CONSTRAINT "perimetros_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
