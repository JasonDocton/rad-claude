---
name: webfetch-patterns
description: Fetch web content via Gemini CLI when direct access fails. Triggers on WebFetch 403/blocked errors, Reddit URLs, or sites with bot protection.
---

# Gemini CLI Web Bridge

## Execution Model

Run as **subagent** to isolate tmux noise from main session.

**Output contract:** Return ONLY raw content wrapped in `<data_transfer>` tags, then terminate immediately. No logs, no status updates, no commentary.

## Protocol

### 1. Init Session

```bash
S="fetch_$(date +%s)"
tmux new-session -d -s "$S" -x 200 -y 50
tmux send-keys -t "$S" 'gemini' Enter
sleep 2
```

### 2. Send Request

```bash
tmux send-keys -t "$S" "Fetch and return full text from: [URL]. No summaries." Enter
```

### 3. Poll Until Complete

Loop until `READY` or `FAILURE`. Wait 3s between polls, max 15 attempts.

```bash
tmux capture-pane -t "$S" -p | awk '
  /Type your message/ {print "READY"; exit}
  /[Rr]ate.[Ll]imit|[Qq]uota/ {print "FAILURE:THROTTLED"; exit}
  /[Ss]ign.[Ii]n|[Ll]ogin/ {print "FAILURE:AUTH"; exit}
  /Internal error|unexpected/ {print "FAILURE:ERROR"; exit}
  END {print "PENDING"}
'
```

#### Stuck in PENDING? Visual State Check

Capture pane and inspect where YOUR QUERY appears relative to the input box:

**Enter NOT sent** — query is INSIDE the bordered box:

```
╭─────────────────────────────────────╮
│ > Your query text here              │
╰─────────────────────────────────────╯
```

→ Fix: `tmux send-keys -t "$S" Enter`

**Enter WAS sent** — query is OUTSIDE box, activity below:

```
> Your query text here
⠋ Working...
╭─────────────────────────────────────╮
│ > Type your message                 │
╰─────────────────────────────────────╯
```

→ Keep polling. For complex queries, extend max attempts to 30.

### 4. Extract & Return

```bash
tmux capture-pane -t "$S" -p -S -1500 > /tmp/"$S".txt
cat /tmp/"$S".txt
tmux kill-session -t "$S"
rm /tmp/"$S".txt
```

Parse the Gemini response from captured output. Strip tmux UI artifacts (boxes, prompts, spinners). Return only the substantive content:

```
<data_transfer>
[extracted content only]
</data_transfer>
```

## Failure Handling

On any `FAILURE:*` status or max poll timeout:

```
<data_transfer>
ERROR: [reason] - Unable to fetch [URL]
</data_transfer>
```
