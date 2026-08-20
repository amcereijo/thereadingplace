import { listReceived } from "../lib/recommendations";

async function main() {
  const receiverId = process.argv[2];
  if (!receiverId) {
    console.error("usage: tsx scripts/check-received.ts <userId>");
    process.exit(1);
  }
  const rows = await listReceived(receiverId);
  console.log(`received for ${receiverId}:`, rows.length);
  for (const r of rows) {
    console.log(`  - [${r.status}] "${r.title}" from ${r.senderId} msg=${JSON.stringify(r.message)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
