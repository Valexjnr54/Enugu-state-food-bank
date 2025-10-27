import path from 'path';
import { PrismaClient } from "../models";
import { uploadUsersFromCsvFolder } from '../utils/upload-csv-folder';
// TODO: update these imports to your real implementations
import * as UserService from '../services/adminServices/user.service';
import { validateUser } from "../validators/userValidator";

const prisma = new PrismaClient();

async function main() {
  const folder = path.resolve(__dirname, '../../public/civil_servants_2/output'); // adjust to your output folder
  const deps = {
    prisma,
    UserService,
    validateUser,
    PrismaClientKnownRequestError: (prisma as any).Prisma?.PrismaClientKnownRequestError,
    runValidation: async (data: any, validator: any) => {
      const validationChains = Array.isArray(validator) ? validator : [validator];
      for (const chain of validationChains) {
        await chain.run(data);
      }
      return validationChains[validationChains.length - 1];
    }
  };

  const { results, errors } = await uploadUsersFromCsvFolder(folder, deps, { batchSize: 100, percent: 0.3 });
  console.log('Uploaded/updated:', results.length, 'Errors:', errors.length);
  if (errors.length) console.log('Errors:', errors);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});