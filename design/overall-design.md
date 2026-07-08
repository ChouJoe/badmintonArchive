# Product Name (Working Title): YuQiuJi (Badminton Log)

- **Form**: WeChat Mini Program (single-user focused, with optional light social features)
- **Positioning**: Personal badminton life manager + light social layer
- **Not** a match-making / game-scheduling platform. Core focus is recording equipment, play sessions, and related feelings to form a personal "badminton archive".

---

## 1. Core Modules Overview

- Equipment Library
- Badminton Life Log
- Light Social Features (optional / later phase)
- Stats & Gentle Reminders

The following describes the required functionality per module (no layout specification).

---

## 2. Equipment Library (Core Module)

Used to record and manage all badminton-related equipment.

### 2.1 Basic Equipment Information

Each piece of equipment should support these fields:

- Brand
- Model
- Type: racket / shoes / bag / shuttle / other
- Price
- Purchase date
- Usage status: in use / retired
- Notes: free text to record subjective feelings, stories, etc.

### 2.2 Equipment Lifecycle Management (Advanced, keep as future direction)

Optional for first version, but the UX should be extensible to support:

- Usage frequency & lifespan stats
- Total usage count / total hours of use per item
- Estimated "lifespan usage ratio", e.g. 100 sessions = 100%, used 60 times = 60%
- Maintenance records
  - For rackets: stringing logs (string model, tension, date, price)
  - For shoes: approximate number of sessions or distance, and when discomfort started
- Retirement reason
  - Enumerated reasons: broken / string breaks too often / not suitable feel / replaced by new model / other
  - Useful for later review and summaries about why gear gets retired

### 2.3 Equipment Experience & Ratings

For each item, support subjective evaluation:

- Overall rating (e.g. 1–10)
- Optional multi-dimension ratings: power, control, speed, protection, etc.
- Time-based experience:
  - Initial feeling when newly acquired
  - Feeling after some period of use (break-in period)
- The system should allow multiple notes over time for the same item

---

## 3. Badminton Life Log

Used to record each play session and the user's personal status.

### 3.1 Session / Training Records

For each play session, support recording:

- Venue
- Date & time period
- Duration
- (Optionally) which equipment was used (e.g. specific racket, shoes)
- Subjective physical/mental state: good / normal / tired (simple tags)
- A short one-line summary: free text (e.g. "Back court felt great today", "Many serve reception errors")

### 3.2 Personal Ability & Status Profile

Basic profile:

- Main discipline: singles / doubles
- Play style: back-court oriented / front-court oriented / all-round
- Dominant hand: left / right

Physical condition & injury tracking:

- Common injury spots (e.g. knees, ankles, wrist)
- Relation to equipment and venue can be noted (e.g. "more knee pain when wearing shoes A than shoes B")

### 3.3 Goals & Gentle Reminders

Users can set personal goals, such as:

- Play at least N times per week
- Try different string tensions X times within a certain period

The system should:

- Track whether goals are reached
- Support simple notifications or visual indicators when goals are not met and when milestones are achieved

---

## 4. Light Social Features (Record & Share Focus, Not Game Scheduling)

Social features are optional and can be implemented in later phases. They focus on sharing records, not on organizing games or matches.

### 4.1 Friends & Equipment Wall / Personal Profile

- Support a simple "friends / follow" relationship within a small circle
- Each user has a personal, partially public area including:
  - **Equipment Wall**: selected equipment cards showing:
    - Brand, model
    - Usage duration (e.g. "used for 1 year / 60 sessions")
    - A one-line remark
  - Visibility settings per user or per item:
    - Public / friends-only / private

### 4.2 Equipment Stories & Tags

Each piece of equipment can have "stories" attached:

- First tournament with this racket
- A memorable match
- How the user got this item (gift, purchase, etc.)

Tagging system for equipment:

- Examples:
  - "First team event racket"
  - "Gifted shoes"
  - "First pair after injury recovery"

### 4.3 Small-circle Sharing & Lending Records

Lending records:

- Which item was lent out
- To whom
- Lend date and return date

Recommendations & reviews:

- Users can write recommendations/reviews for specific equipment
- Friends can "save" these reviews as references for future purchases
- **Emphasis**: this is small-circle reference sharing, not an open marketplace or second-hand trading platform

---

## 5. Stats & Gentle Reminders

Used to help users review their equipment investment and usage patterns.

### 5.1 Spending & Equipment Statistics

Statistical dimensions:

- Total spending on equipment in a given period
- Spending by type (rackets / shoes / bags / shuttles / others)
- Brand distribution: which brands are purchased most frequently

Example gentle prompts:

- "This year you have bought 3 rackets and 2 pairs of shoes"
- Help users reflect on their consumption habits

### 5.2 Usage Frequency & Lifespan Statistics

Per-equipment statistics:

- Number of sessions / total hours of use
- Estimated lifespan usage ratio

Example reminders:

- When strings on a racket have not been changed for more than N sessions or X months → suggest restring
- When shoes have passed a certain session count → suggest paying attention to cushioning and protection
- Thresholds should be user-configurable
