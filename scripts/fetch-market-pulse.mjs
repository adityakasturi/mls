#!/usr/bin/env node

const url = process.env.WEBSITE_MLS_DATA_URL;
const token = process.env.WEBSITE_MLS_DATA_TOKEN;
if (!url || !token) {
  console.error("WEBSITE_MLS_DATA_URL and WEBSITE_MLS_DATA_TOKEN are required.");
  process.exit(1);
}

try {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const report = await response.json();
  if (!response.ok || report?.status !== "ready") {
    throw new Error(`Market pulse blocked: ${report?.code || response.status}.`);
  }
  const rows = report.cities
    .map(
      (item) =>
        `| ${item.city} | ${item.activeInventory} | ${item.new24h} | ${item.new7d} | ${item.pending} | ${item.fastMoving7d} | ${item.updated24h} | ${item.sellerOpportunity21d} |`,
    )
    .join("\n");
  process.stdout.write(`# Eastside Market Pulse

**MLS data through:** ${report.sourceAsOf}<br>
**Report checked:** ${report.checkedAt}<br>
**Coverage:** ${report.listingCount} display-permitted records

| City | Active | New 24h | New 7d | Pending/AUC | Listed <=7d and now pending/AUC | Updated 24h | Active 21+ DOM |
|---|---:|---:|---:|---:|---:|---:|---:|
${rows}

${report.compliance.sourceLine}

${report.compliance.consumerDisclaimer}
`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Market pulse request failed.");
  process.exit(1);
}
