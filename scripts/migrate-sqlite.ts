import path from "node:path";
import { createClient } from "@libsql/client";
import { RESOURCE_SLUGS } from "../lib/metadata/resources";
import { replaceResourceRows, type StorageRow } from "../lib/db/client";

async function main() {
  const sourcePath = path.resolve(process.argv[2] ?? ".data/app.sqlite");
  const source = createClient({ url: `file:${sourcePath}` });

  for (const slug of RESOURCE_SLUGS) {
    const result = await source.execute(`SELECT * FROM ${slug} ORDER BY rowid`);
    await replaceResourceRows(slug, result.rows.map((row) => ({ ...row }) as StorageRow));
    console.log(`Migrated ${result.rows.length} ${slug}`);
  }

  source.close();
}

void main();
