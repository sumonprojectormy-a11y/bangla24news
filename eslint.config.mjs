import { defineConfig, globalIgnores } from 'eslint/config'
import next from 'eslint-config-next/core-web-vitals'
import ts from 'eslint-config-next/typescript'
export default defineConfig([...next,...ts,{files:['public/reader/*.js'],rules:{'@typescript-eslint/no-unused-vars':'off'}},globalIgnores(['.next/**','next-env.d.ts'])])

// The reader uses ordered classic scripts. Helper declarations are consumed by other files.
