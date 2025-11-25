-- AlterTable
ALTER TABLE "BeagleProgram" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
