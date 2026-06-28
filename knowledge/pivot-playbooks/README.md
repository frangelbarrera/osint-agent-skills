# Pivot Playbooks

Pivot playbooks define what the agent does when it discovers a specific type of finding. Each playbook has a **trigger**, a sequence of **steps**, **anti-patterns** (what NOT to do), and an **output format**. The agent follows these by default unless the user constrains scope.

## How pivot playbooks work

When the agent discovers an email address, username, domain, IP address, phone number, cryptocurrency wallet, photograph, document with metadata, or breach entry during an investigation, it consults the corresponding playbook. The playbook tells the agent what to collect next, in what order, using which tools, and what to report back.

## Available playbooks

| Playbook | Trigger | Free tools? |
|---|---|---|
| [`email-to-username.md`](email-to-username.md) | You found an email address | Yes |
| [`username-to-identity.md`](username-to-identity.md) | You found a username | Yes |
| [`domain-to-infrastructure.md`](domain-to-infrastructure.md) | You found a domain | Yes |
| [`ip-to-attribution.md`](ip-to-attribution.md) | You found an IP address | Yes |
| [`breach-to-credentials.md`](breach-to-credentials.md) | You confirmed an email is in a breach | No (API key) |
| [`phone-to-person.md`](phone-to-person.md) | You found a phone number | Partially |
| [`crypto-to-fiat.md`](crypto-to-fiat.md) | You found a cryptocurrency wallet | Yes |
| [`photo-to-location.md`](photo-to-location.md) | You have a photo to geolocate | Yes |
| [`metadata-to-attribution.md`](metadata-to-attribution.md) | You have a document with metadata | Yes |

## Structure of a playbook

```markdown
# Playbook: [source] to [target]

## Trigger

[What finding activates this playbook]

## Steps

1. **Step name** â€” `tool command` â€” expected output â€” why it matters
2. ...

## Anti-patterns

- Do NOT [common mistake]
- ...

## Output format

[How to report the pivot's results]
```

## Contributing new playbooks

Use `.github/ISSUE_TEMPLATE/playbook-request.md` to propose a new playbook. Good candidates for new playbooks:

- Certificate to infrastructure
- URL to archive history
- Image to source
- Profile picture to identity
- Link-in-bio to identity
