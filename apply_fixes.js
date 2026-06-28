const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const repo = __dirname;

// Helper
function runCmd(cmd) {
    try {
        return execSync(cmd, {cwd: repo, encoding: 'utf8', shell: '/bin/bash'});
    } catch(e) {
        return (e.stdout || '') + (e.stderr || '');
    }
}

// Init git
runCmd('git init && git config user.email "test@example.com" && git config user.name "Test" && git add . && git commit -m "Init"');

// Fix 1
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('.git') && !file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else {
      results.push(file);
    }
  });
  return results;
}
const files = walk(repo);
let fix1Count = 0;
files.forEach(file => {
  if (file.match(/\.(png|jpg|jpeg|gif|pdf|zip)$/i)) return;
  let buf = fs.readFileSync(file);
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    fs.writeFileSync(file, buf.slice(3));
    fix1Count++;
  }
});
console.log("Fix 1: OK - " + fix1Count + " files modified");

// Fix 2
const validateYmlPath = path.join(repo, '.github/workflows/validate.yml');
let validateYml = fs.readFileSync(validateYmlPath, 'utf8');
validateYml = validateYml.replace('branches: [master]', 'branches: [main]');
fs.writeFileSync(validateYmlPath, validateYml);
console.log("Fix 2: OK");

// Fix 3
const phoneToPersonPath = path.join(repo, 'knowledge/pivot-playbooks/phone-to-person.md');
let content = fs.readFileSync(phoneToPersonPath, 'utf8');
const oldP = `## Step 6: Phone-only breach search via HIBP

- **Tool:** HIBP API v3 — https://haveibeenpwned.com/API/v3 (phone-search endpoint)
- **Command:**
  \`\`\`bash
  curl -s -H "hibp-api-key: $HIBP_KEY" \\
       -H "user-agent: osint-agent-skills" \\
       "https://haveibeenpwned.com/api/v3/breachstats?phone=15551234567" \\
    | jq '.Breaches[] | {Name, BreachDate, DataClasses}'
  \`\`\`
  Note: HIBP's phone-search endpoint was introduced in 2020 and covers breaches that exposed phone numbers (Facebook 2021, LinkedIn 2021 phone-leak, etc.).
- **Expected output:** List of breaches where this phone number appears, with breach dates and exposed data classes.
- **Pivot point:** Each breach is a candidate pivot into \`breach-to-credentials.md\`. The breach record typically includes the email and username associated with the phone in that breach — the strongest cross-link available for phone-based identity attribution.`;
const newP = `## Step 6: Phone number in breach data

> **Note:** HaveIBeenPwned (HIBP) does not support native phone number
> searches via its API — the \`breachstats?phone=\` endpoint does not
> exist. HIBP only supports email-based queries.
>
> To search for phone numbers in breach data, use alternative services:
> - **DeHashed** — supports phone-number queries (paid API key required)
> - **IntelX** — supports phone-number queries (free tier available)
>
> Use the E.164 normalized phone number (from Step 1) as the search
> query. Record any breaches or associated identities discovered, and
> pivot to \`breach-to-credentials.md\` for credential-based follow-up.`;
if(content.includes(oldP)) {
    content = content.replace(oldP, newP);
    fs.writeFileSync(phoneToPersonPath, content);
    console.log("Fix 3: OK");
} else {
    console.log("Fix 3: FAIL (pattern not found)");
}

// Fix 4
const tpl1 = path.join(repo, 'templates/reports/investigation-summary.md');
const tpl2 = path.join(repo, 'templates/reports/person-profile.md');
const tpl3 = path.join(repo, 'templates/reports/threat-assessment.md');
[tpl1, tpl2].forEach(f => {
    let text = fs.readFileSync(f, 'utf8');
    text = text.replace('- Confidence: [High / Moderate / Low]', '- Confidence: [Confirmed / Probable / Unverified / Inferred / Speculative]');
    fs.writeFileSync(f, text);
});
let t3Text = fs.readFileSync(tpl3, 'utf8');
let t3Count = 0;
t3Text = t3Text.replace(/- Confidence: \[High \/ Moderate \/ Low\]/g, match => {
    t3Count++;
    if (t3Count <= 2) return '- Confidence: [Confirmed / Probable / Unverified / Inferred / Speculative]';
    return match;
});
fs.writeFileSync(tpl3, t3Text);
console.log("Fix 4: OK");

// Fix 5
const fix5files = ['system-prompt.md', 'README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'];
const targetBuf = Buffer.from([0xe2, 0x80, 0x94, 0xe2, 0x80, 0x9d]);
const repBuf = Buffer.from([0xe2, 0x80, 0x94]);
fix5files.forEach(f => {
  const p = path.join(repo, f);
  let buf = fs.readFileSync(p);
  let idx;
  while ((idx = buf.indexOf(targetBuf)) !== -1) {
    buf = Buffer.concat([buf.slice(0, idx), repBuf, buf.slice(idx + targetBuf.length)]);
  }
  fs.writeFileSync(p, buf);
});
console.log("Fix 5: OK");

// Fix 6
const mcpPath = path.join(repo, 'tools/mcp-server.js');
let mcpText = fs.readFileSync(mcpPath, 'utf8');
const mcpInsert = `  if (toolName === "gravatar_lookup") {
    var hash = require("crypto").createHash("md5").update(args.email.trim().toLowerCase()).digest("hex");
    endpoint = "https://www.gravatar.com/" + hash + ".json";
  }
  if (toolName === "hunter_email_finder") {`;
mcpText = mcpText.replace('  if (toolName === "hunter_email_finder") {', mcpInsert);
fs.writeFileSync(mcpPath, mcpText);
console.log("Fix 6: OK");

// Fix 7
let valLines = fs.readFileSync(validateYmlPath, 'utf8').split('\\n');
let start_idx = -1;
let end_idx = -1;
for (let i = 0; i < valLines.length; i++) {
    if (valLines[i].includes('find . -name "*.md" -exec grep') && start_idx === -1) {
        start_idx = i;
    }
    if (start_idx !== -1 && valLines[i].includes('done') && i > start_idx) {
        end_idx = i;
        break;
    }
}
if (start_idx !== -1 && end_idx !== -1) {
    const new_block = `          find . -name "*.md" -print0 | while IFS= read -r -d '' mdfile; do
            grep -oP '\\[.*?\\]\\((?!http)(?!#)(.*?)\\)' "$mdfile" | while IFS= read -r match; do
              file=$(echo "$match" | grep -oP '(?<=\\().*(?=\\))')
              target=$(realpath -m "$(dirname "$mdfile")/$file")
              if [ ! -f "$target" ]; then
                echo "Broken link: $file in $mdfile"
                exit 1
              fi
            done
          done`;
    valLines.splice(start_idx, end_idx - start_idx + 1, new_block);
    fs.writeFileSync(validateYmlPath, valLines.join('\\n'));
    console.log("Fix 7: OK");
} else {
    console.log("Fix 7: FAIL (block not found)");
}

// Generate Validation Reports
console.log("\\n=== VALIDATIONS ===");
console.log("Val 1: " + runCmd("grep -rl $'\\xEF\\xBB\\xBF' . --exclude-dir=.git || echo 'EMPTY'").trim());
console.log("Val 2: " + runCmd('grep "branches:" .github/workflows/validate.yml').trim());
console.log("Val 3: " + runCmd('grep -n "breachstats\\|phone-search endpoint" knowledge/pivot-playbooks/phone-to-person.md || echo "EMPTY"').trim());
console.log("Val 4: " + runCmd('grep -rn "High / Moderate / Low" templates/reports/').trim());
console.log("Val 5: " + runCmd('grep -cP \'\\x{2014}\\x{201D}\' system-prompt.md README.md CHANGELOG.md CONTRIBUTING.md').trim());
console.log("Val 6: " + runCmd('node --check tools/mcp-server.js && echo "NO ERRORS"').trim());
console.log("Val 7: " + runCmd(`find . -name "*.md" -not -path "./.git/*" -print0 | while IFS= read -r -d '' mdfile; do grep -oP '\\[.*?\\]\\((?!http)(?!#)(.*?)\\)' "$mdfile" | while IFS= read -r match; do file=$(echo "$match" | grep -oP '(?<=\\().*(?=\\))'); target=$(realpath -m "$(dirname "$mdfile")/$file"); if [ ! -f "$target" ]; then echo "Broken link: $file in $mdfile"; fi; done; done || echo "EMPTY"`).trim());

console.log("\\n=== GIT STATS ===");
console.log(runCmd('git diff --stat'));
console.log("\\n=== GIT STATUS ===");
console.log(runCmd('git status'));
