-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "nextDueAmount" DECIMAL(10,2),
ADD COLUMN     "nextDueDate" TIMESTAMP(3);
