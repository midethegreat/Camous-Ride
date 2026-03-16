const BASE = process.env.API_URL || "http://localhost:3000";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(method, path, body) {
  const url = `${BASE}${path}`;
  const init = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) init.body = JSON.stringify(body);
  const res = await fetch(url, init).catch((e) => {
    throw new Error(`Fetch failed for ${method} ${url}: ${e.message}`);
  });
  let text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  const results = [];
  const email = `smoke_${Date.now()}@example.com`;
  const matricNumber = `SMK${Math.floor(1000 + Math.random() * 9000)}`;
  console.log(`[smoke] Using email=${email} matric=${matricNumber}`);

  // 1) Ping a simple route that doesn't mutate state
  try {
    const r = await req("GET", "/api/notifications/health-check-nop");
    results.push({ step: "notifications route exists", pass: r.status !== 404 });
  } catch (e) {
    results.push({ step: "notifications route exists", pass: false, error: e.message });
  }

  // 2) Register a user (expected 201 or 200 if OTP resent / already exists)
  try {
    const r = await req("POST", "/api/users/register", {
      matricNumber,
      pin: "0000",
      idCardImage: null,
      email,
      fullName: "Smoke Test",
      department: "QA",
      level: "100",
      phoneNumber: "08000000000",
    });
    results.push({
      step: "register",
      pass: r.ok || r.status === 400,
      status: r.status,
      message: r.json?.message,
    });
  } catch (e) {
    results.push({ step: "register", pass: false, error: e.message });
  }

  // 3) Try login (likely to fail until OTP verified) but endpoint should respond
  try {
    const r = await req("POST", "/api/users/login", {
      matricNumber,
      pin: "0000",
    });
    results.push({
      step: "login",
      pass: r.status === 200 || r.status === 401 || r.status === 403,
      status: r.status,
      message: r.json?.message,
    });
  } catch (e) {
    results.push({ step: "login", pass: false, error: e.message });
  }

  // 4) List rides for a random user (should not 500)
  try {
    const r = await req("GET", "/api/rides/user/unknown-user-id");
    results.push({
      step: "rides list",
      pass: r.status === 200 || r.status === 404,
      status: r.status,
    });
  } catch (e) {
    results.push({ step: "rides list", pass: false, error: e.message });
  }

  // Summarize
  const failed = results.filter((x) => !x.pass);
  console.log("\n[smoke] Results:");
  for (const r of results) console.log(`- ${r.step}: ${r.pass ? "PASS" : "FAIL"}`, r.status ? `(status ${r.status})` : "", r.message ? `- ${r.message}` : "", r.error ? `- ${r.error}` : "");
  if (failed.length) {
    console.error(`[smoke] ${failed.length} step(s) failed`);
    process.exit(1);
  } else {
    console.log("[smoke] All checks passed");
  }
}

main().catch((e) => {
  console.error("[smoke] Unexpected error:", e);
  process.exit(1);
});
