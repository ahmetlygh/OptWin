-- CreateTable
CREATE TABLE "script_labels" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "script_labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "script_labels_lang_key_key" ON "script_labels"("lang", "key");
