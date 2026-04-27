# **1. Core Model (what Porygon “is”)**

Porygon has:

### **Internal state**

- `hasInteracted` (boolean)
- `interactionCount` (number)
- `currentZone` (name / logs / projects / garden / null)
- `lastZone` (to prevent repetition)
- `cooldown` (to avoid spam)
- `mood` (neutral → curious → witty)

---

# **2. State Machine (high-level)**

### **States**

- Idle
- Activated (first interaction)
- Engaged (subsequent interactions)
- Inspecting (hovering zones)
- Settled (snapped/drop moment)

---

# **3. First Interaction (critical moment)**

### **Trigger**

- First drag OR first click

### **Behavior sequence**

1. Show: “Scanning…” (short delay)
2. Then show: **one primary line**
3. Lock out further messages for ~1–2s

### **Output tone**

- Neutral
- Slight awareness

### **Example intent**

“Something touched me → I woke up”

---

# **4. Interaction Progression (personality evolution)**

Every interaction increments `interactionCount`

### **Phase 1 (1–2 interactions)**

Mood: **neutral**

- “User detected.”
- “Input received.”

---

### **Phase 2 (3–5 interactions)**

Mood: **curious**

- “You again.”
- “Exploring…”

---

### **Phase 3 (6+ interactions)**

Mood: **witty / slightly self-aware**

- “I see a pattern.”
- “Consistent behavior.”

---

### **Key rule**

Never jump tone suddenly  
It should feel like gradual awareness

---

# **5. Zone Detection (context awareness)**

While dragging:

Continuously detect:

- Name
- Intellect Logs
- Projects
- Knowledge Garden

---

### **Behavior rules**

#### **A. Entering a zone**

- Trigger message ONCE
- Do not repeat if staying in same zone

#### **B. Leaving a zone**

- No message (silence is cleaner)

#### **C. Re-entering same zone**

- Only trigger if:
    - Enough time passed OR
    - User left significantly

---

# **6. Zone Dialogue Logic**

Each zone has:

- 2–3 base lines
- Optional rare override

### **Selection priority:**

1. Rare line (low probability)
2. Normal line
3. Avoid last used line

---

### **Tone per zone**

**Name**  
→ identity / importance

**Logs**  
→ thinking / messy cognition

**Projects**  
→ execution / reality

**Garden**  
→ exploration / abstract

---

# **7. Rare Event Layer (adds life)**

Independent of everything:

### **Trigger chance**

~5–10%

### **Conditions**

- Any interaction
- Any zone entry

### **Behavior**

Overrides normal dialogue

### **Purpose**

Break predictability

---

# **8. Anti-Spam System (very important)**

Without this, it feels cheap.

### **Rules**

- Minimum gap between messages (~800–1200ms)
- No same line twice in a row
- Zone messages override idle messages
- Interaction messages override zone messages (priority)

---

# **9. Priority System (conflict resolution)**

When multiple triggers happen:

### **Highest priority**

1. First interaction
2. New interaction (drag start)
3. Zone entry
4. Idle/random

Only one message at a time.

---

# **10. Drop / Snap Behavior**

When dropped on something:

### **If meaningful target (like name)**

- Show confirmation tone
    - “Identity confirmed.”
    - “You made this.”

### **If random area**

- No message OR very subtle

---

# **11. Idle Behavior**

If no interaction for a while:

- Occasionally:
    - “Awaiting input.”
    - “Monitoring…”

Very low frequency  
Don’t annoy the user

---

# **12. Overall Experience You’re Creating**

This should feel like:

- Not a mascot
- Not a chatbot
- Not random tooltips

But:

A small system that notices, reacts, and slowly becomes aware

---

# **13. What makes this feel high quality**

If done right:

- No repetition
- No spam
- Subtle humor
- Slight unpredictability
- Clear progression

If done wrong:

- Too many messages
- Same lines repeating
- Instant tone jumps
- Overly “funny”

---

# **14. Final mental model**

Think of it as:

A lightweight agent with:

- memory (interactionCount)
- context (zone)
- personality curve (mood)
- randomness (rare events)
- discipline (cooldowns)

---

Good. Now we’ll **merge your exact dialogues into the behavior system cleanly**, so it’s structured, consistent, and feels intentional.

No code. Just **final system design you can implement directly.**

---

# **0. Final Mental Model**

You now have **3 dialogue layers**:

1. **Interaction Layer** → first touch + progression
2. **Zone Layer** → contextual (your sections)
3. **Rare Layer** → overrides everything occasionally

All controlled by:

- memory (interactionCount)
- context (zone)
- discipline (cooldown + no repetition)

---

# **1. Dialogue Pool (your content structured properly)**

## **A. First Interaction (Activation Layer)**

Used **only once ever**

Tone: neutral / awakening

```
“Oh. You’re real.”
“User detected.”
“Interaction… unexpected.”
“You activated me.”
“You found me.”
“Hello, operator.”
“I was waiting.”
“You weren’t supposed to find this…”
```

---

## **B. Progression Layer (Personality evolution)**

### **Phase 1 (1–2 interactions) → Neutral**

You can reuse lighter ones from above or keep minimal:

- “User detected.”
- “Input received.”

---

### **Phase 2 (3–5 interactions) → Curious**

- “You again.”
- “Exploring…”
- “Still here.”
- “Interesting.”

---

### **Phase 3 (6+ interactions) → Witty**

- “I see a pattern.”
- “Consistent behavior.”
- “You like this.”
- “Predictable.”

---

# **2. Zone Layer (your exact content mapped)**

Each zone = **2–3 lines (clean, punchy)**

---

## **Name (identity)**

- “Creator… probably.”
- “Main character?”

---

## **Intellect Logs (thinking)**

- “Brain dump.”
- “Thinking… loudly.”
- “Mind in progress.”

---

## **Projects (execution)**

- “Built, not talked.”
- “Breakable systems.”
- “It runs. Mostly.”

---

## **Knowledge Garden (exploration)**

- “Touch grass. Mentally.”
- “Messy on purpose.”
- “Connections everywhere.”

---

# **3. Rare Layer (global override)**

Low probability (~5–10%)

```
“Beep. Interesting.”
“Scan complete… maybe.”
“Suspiciously smart.”
“Data smells good.”
“Worth inspecting.”
```

---

# **4. How Everything Connects (Actual Logic Flow)**

## **A. First Interaction**

Trigger:

- First drag OR click

Flow:

1. “Scanning…” (brief)
2. Pick ONE from **First Interaction pool**
3. Lock system (~1–2s)

---

## **B. Every Next Interaction**

Increment `interactionCount`

Then:

- Select from **Progression Layer** based on phase

---

## **C. While Dragging (Zone System)**

Continuously detect zone

### **On entering a new zone:**

1. Check cooldown
2. Check if different from `lastZone`
3. Trigger ONE zone line

### **On staying:**

- No repeat

### **On leaving:**

- Silence

---

## **D. Rare Override**

Before showing ANY message:

Roll probability:

If triggered:  
→ Replace with Rare line  
→ Skip normal selection

---

# **5. Priority System (final)**

When multiple events happen:

1. First interaction
2. Interaction progression
3. Zone entry
4. Idle

Only one message survives.

---

# **6. Anti-Repetition Rules (important)**

- Never show same line twice in a row
- Track `lastLine`
- Rotate within each pool
- Zone lines should not repeat immediately on re-entry

---

# **7. Cooldown System**

After any message:

- Block new messages for ~800–1200ms

Prevents:

- spam while dragging
- jittery UI

---

# **8. Drop / Snap Behavior (optional but clean)**

When dropped:

### **On meaningful zone (like name):**

- “Creator confirmed.”
- “You made this.”

### **Otherwise:**

- No message

---

# **9. Mood Mapping (clean abstraction)**

Instead of random tone, tie it to interactionCount:

|**Count**|**Mood**|**Layer Used**|
|---|---|---|
|0|dormant|none|
|1|neutral|first|
|2–3|neutral|progression|
|4–5|curious|progression|
|6+|witty|progression|

---

# **10. What This Feels Like (final UX)**

User experience:

- First touch → “Oh. You’re real.”
- Drag → enters Projects → “Built, not talked.”
- Later interactions → “You again.”
- Even later → “I see a pattern.”
- Rare moment → “Beep. Interesting.”

No spam. No repetition. No noise.

---

# **11. Why this works**

You now have:

- Clear separation of concerns
- Controlled randomness
- Personality progression
- Context awareness
- Minimal but expressive lines

This is no longer “tooltip UI”

This is:

a lightweight reactive entity

---

