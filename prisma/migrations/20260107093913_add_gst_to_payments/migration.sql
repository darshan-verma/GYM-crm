-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "gstAmount" DECIMAL(10,2),
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "gstPercentage" DECIMAL(5,2);
