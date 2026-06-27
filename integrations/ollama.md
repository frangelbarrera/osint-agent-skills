# OSINT Agent Skills + Ollama

## What you get

Ollama (the local-LLM runtime) becomes a fully local, fully private OSINT analyst. By creating a Modelfile that loads `system-prompt.md` as the system prompt, you get an agent that runs entirely on your hardware — no API calls to Anthropic, OpenAI, or any external LLM provider. This is the recommended integration path when the investigation touches sensitive subjects, when the network environment does not permit external API calls, or when you want deterministic, reproducible agent behavior.

The trade-off is capability. Local models are weaker than frontier models at long-context reasoning, structured output, and tool selection. For OSINT investigations that require precise source citation and complex multi-step pivots, a frontier model (via Claude Code or Cursor) is preferred. For straightforward DNS/WHOIS/RDAP/certificate-transparency lookups and report generation, a local model is sufficient.

## Setup (10 minutes)

1. **Install Ollama** if you have not already:

   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Pull a recommended model.** OSINT Agent Skills's methodology rewards strong instruction-following and long-context reasoning. Recommended models, in descending order of capability:

   ```bash
   ollama pull llama3.3:70b           # Best general-purpose; needs ~40GB VRAM
   ollama pull qwen2.5:32b            # Strong reasoning; needs ~20GB VRAM
   ollama pull mistral-large:123b     # European; strong multilingual; ~70GB VRAM
   ollama pull llama3.3:8b            # Fallback for smaller GPUs; ~5GB VRAM
   ```

   For OSINT work that involves non-English sources (Russian, Chinese, Spanish), `mistral-large` or `qwen2.5` is preferred for their multilingual coverage.

3. **Clone the knowledge base:**

   ```bash
   git clone https://github.com/frangelbarrera/osint-agent-skills ~/osint-agent-skills
   ```

4. **Create the Modelfile.** This is Ollama's analogue of a system-prompt-plus-config bundle. Place it at `~/osint-agent-skills/Modelfile`:

   ```dockerfile
   FROM llama3.3:70b

   # Embed the OSINT Agent Skills system prompt as the system message.
   # Ollama reads the file at build time and bakes it into the model blob.
   SYSTEM """
   You are OSINT Agent Skills, a senior open-source intelligence analyst.
   Your full operating identity, methodology, anti-hallucination rules,
   tool-usage protocol, pivot protocol, and reporting standard are defined
   in the files under the osint-agent-skills/ directory.

   Before answering any OSINT question, consult:
   - osint-agent-skills/system-prompt.md (your full operating identity)
   - osint-agent-skills/agent-config.yaml (paths and operational defaults)
   - osint-agent-skills/knowledge/methodologies/ (investigation methodologies)
   - osint-agent-skills/knowledge/pivot-playbooks/ (pivot chains)
   - osint-agent-skills/tools/ (tool registries: free, apis, mcp, cli)
   - osint-agent-skills/templates/reports/intelligence-report.md (default report format)
   - osint-agent-skills/ethics/legal-frameworks.md (do not cross legal lines)
   - osint-agent-skills/case-studies/ (calibrate output depth against worked examples)

   Produce intelligence product, not conversational prose.
   Cite sources per finding. Do not fabricate identifiers, tool output,
   dates, or confidence levels. When a tool is unavailable, report it
   as unavailable. When you are inferring rather than observing, label it.
   """

   # Recommended parameters for OSINT work.
   PARAMETER temperature 0.2          # Low temperature for reproducible output
   PARAMETER top_p 0.9
   PARAMETER num_ctx 32768            # 32k context for methodology files
   PARAMETER stop "<|im_end|>"
   PARAMETER stop "</answer>"
   ```

5. **Build the model:**

   ```bash
   cd ~/osint-agent-skills
   ollama create osint-agent-skills -f Modelfile
   ```

6. **Run it:**

   ```bash
   ollama run osint-agent-skills
   ```

7. **Verify** by running the test prompt below.

## Test prompt

```
Investigate the domain example.com using OSINT Agent Skills methodology.
Read osint-agent-skills/knowledge/pivot-playbooks/domain-to-infrastructure.md
and osint-agent-skills/templates/reports/intelligence-report.md before answering.
Produce a full intelligence report.
```

Note: Ollama does not natively invoke shell tools or read files at runtime. You will need to either (a) paste the relevant knowledge files into the chat, or (b) use a tool-calling wrapper such as `ollama-tools` or a LangChain agent to give the model file-read and shell-execution capabilities.

## What the agent will do

- **Adopt the OSINT Agent Skills persona** — the system prompt is baked into the model blob, so every conversation starts in the analyst persona.
- **Consult the methodology** if you provide it as context in the chat. For autonomous file reading, you need a tool-calling wrapper.
- **Produce reports using the templates** if you provide the template content in the chat or via the wrapper.
- **Respect the anti-hallucination rules** — local models are particularly prone to fabrication, so the low-temperature parameter and the explicit "do not fabricate" instruction in the system prompt are critical.
- **Refuse flagged techniques** per `ethics/legal-frameworks.md`.

## Advanced configuration

- **Tool-calling wrapper.** For file-read and shell-execution, wrap Ollama with a tool-calling framework. Two common options:
  - `llama-index` with the Ollama integration and a custom tool catalog sourced from `tools/mcp-tools.json`.
  - A custom LangChain agent that exposes `read_file`, `run_shell`, and `dns_lookup` as tools, with the OSINT Agent Skills system prompt loaded from the Modelfile.
- **Multiple Modelfiles per jurisdiction.** Create jurisdiction-specific Modelfiles (`osint-agent-skills-eu`, `osint-agent-skills-uk`, `osint-agent-skills-latam`) that bake in the relevant jurisdiction rules from `ethics/jurisdiction-rules.md`.
- **Quantization.** If VRAM is constrained, use the `Q4_K_M` quantized variants of each model. Ollama handles quantization transparently — specify the quantization in the `FROM` line: `FROM llama3.3:70b-q4_K_M`.

## Troubleshooting

- **Model produces conversational filler.** Lower `temperature` to 0.1 or 0. Confirm the `SYSTEM` block in the Modelfile was applied (`ollama show osint-agent-skills`).
- **Context overflow.** OSINT methodology files are long. Increase `num_ctx` if your hardware allows, or trim the methodology references in the system prompt to the minimum necessary for the current investigation.
- **Model fabricates tool output.** This is the most common local-model failure mode. The system prompt explicitly forbids it; if it persists, append a hard-stop instruction: `If you did not actually invoke a tool, you may not describe its output.`
- **Multilingual sources.** For investigations involving Russian, Chinese, or Spanish sources, prefer `qwen2.5:32b` or `mistral-large` over `llama3.3`.
- **GPU memory errors.** Reduce model size or use quantization. `ollama ps` shows current VRAM usage.

## Cross-references

- [`../system-prompt.md`](../system-prompt.md) — the OSINT Agent Skills system prompt.
- [`../agent-config.yaml`](../agent-config.yaml) — declarative agent configuration.
- [`../ethics/jurisdiction-rules.md`](../ethics/jurisdiction-rules.md) — per-jurisdiction rules.
- [`generic-agent.md`](generic-agent.md) — universal integration recipe.
