npx prisma2 generate
npx babel src --out-dir dist --copy-files
npx prisma2 lift up
npm start