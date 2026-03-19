# Sample Dialogue Content - Testing

## Character Setup for Testing

### Main Character (Player)
- **Name**: Alex
- **Role**: New cafe owner
- **Personality**: Friendly, ambitious, stylish

### Supporting Characters
- **Sarah**: Best friend and barista
- **Jessica**: Rival cafe owner
- **Mike**: Regular customer
- **Emma**: Fashionista customer

## Sample Dialogue Scripts

### 1. Introduction Dialogue (intro_dialogue)

**Dialogue ID**: `intro`
**Chapter**: Chapter 1 - Grand Opening
**Characters**: Alex, Sarah

```csharp
// Dialogue Line 1
Character: Alex
Text: "Wow... I can't believe I finally own my own cafe! The place looks amazing with all these pastel decorations."
Expression: happy
Sprite: alex_happy

// Dialogue Line 2
Character: Sarah
Text: "It's totally dreamy, Alex! The pink walls and purple accents are so 2000s chic. Your customers are going to love it!"
Expression: excited
Sprite: sarah_excited

// Dialogue Line 3
Character: Alex
Text: "Thanks! I'm a little nervous though. What if nobody comes? Or worse, what if I mess up their orders?"
Expression: worried
Sprite: alex_worried

// Dialogue Line 4
Character: Sarah
Text: "Don't worry! I'll help you get started. We can practice making some drinks together. Plus, I heard the grand opening special is bringing in lots of curious customers!"
Expression: supportive
Sprite: sarah_supportive
```

**Choices**:
1. "You're right! Let's start with some basic coffee recipes." 
   - Next: `coffee_practice`
   - Effect: +5 friendship with Sarah
   - Tag: `coffee_training`

2. "I'm more worried about the business side. Can you help me with customer service?"
   - Next: `customer_service`
   - Effect: +5 business relationship with Sarah
   - Tag: `business_focus`

3. "Actually, let's just open and see what happens! I learn better by doing."
   - Next: `first_customer`
   - Effect: +3 friendship, unlocks cafe immediately
   - Tag: `learn_by_doing`

---

### 2. First Customer Dialogue (first_customer)

**Dialogue ID**: `first_customer`
**Chapter**: Chapter 1 - Grand Opening
**Characters**: Alex, Mike

```csharp
// Dialogue Line 1
Character: Mike
Text: "Hi there! I heard there's a new cafe in town. The decorations caught my eye from outside!"
Expression: friendly
Sprite: mike_friendly

// Dialogue Line 2
Character: Alex
Text: "Welcome! Yes, we just opened today! I'm Alex, the owner. What can I get for you?"
Expression: professional
Sprite: alex_professional

// Dialogue Line 3
Character: Mike
Text: "I'll try a vanilla latte. And wow, this place really takes me back to the 2000s aesthetic. Reminds me of those Barbie My Scene dolls!"
Expression: nostalgic
Sprite: mike_nostalgic

// Dialogue Line 4
Character: Alex
Text: "That's exactly what I was going for! One vanilla latte coming right up. Will that be for here or to go?"
Expression: happy
Sprite: alex_happy
```

**Choices**:
1. "For here, I'd love to enjoy the atmosphere!"
   - Next: `dine_in_experience`
   - Effect: +5 friendship with Mike
   - Tag: `dine_in_customer`

2. "To go, I'm actually on my way to work."
   - Next: `quick_service`
   - Effect: +3 friendship, +2 business
   - Tag: `takeout_customer`

3. "Hmm, what do you recommend? I'm feeling adventurous!"
   - Next: `recommendation`
   - Effect: +7 friendship if good recommendation
   - Tag: `adventurous_customer`

---

### 3. Rival Cafe Owner Dialogue (meet_rival)

**Dialogue ID**: `meet_rival`
**Chapter**: Chapter 3 - Rival Cafe
**Characters**: Alex, Jessica

**Requirements**: 
- Complete Chapter 2
- 40+ friendship with Sarah
- Serve 20 customers

```csharp
// Dialogue Line 1
Character: Jessica
Text: "Well, well, well... So this is the cute little pastel cafe I've been hearing about. It's... pink."
Expression: skeptical
Sprite: jessica_skeptical

// Dialogue Line 2
Character: Alex
Text: "Jessica! I didn't expect to see you here. I heard you opened that minimalist coffee shop downtown."
Expression: surprised
Sprite: alex_surprised

// Dialogue Line 3
Character: Jessica
Text: "Yes, 'The Modern Bean.' We focus on quality coffee without all the... fluff. But I suppose there's a market for nostalgia."
Expression: smug
Sprite: jessica_smug

// Dialogue Line 4
Character: Alex
Text: "My customers seem to love the fluff! But I'm sure your place is nice too. We're probably after different crowds anyway."
Expression: confident
Sprite: alex_confident

// Dialogue Line 5
Character: Jessica
Text: "Maybe. Or maybe we'll see who comes out on top. May the best cafe win... though I'm pretty sure I already know the answer."
Expression: competitive
Sprite: jessica_competitive
```

**Choices**:
1. "Competition is healthy! May the best cafe win indeed."
   - Next: `friendly_rivalry`
   - Effect: +5 business relationship with Jessica
   - Tag: `friendly_competition`

2. "Why are you being so hostile? We could actually work together."
   - Next: `potential_partnership`
   - Effect: +10 friendship if successful, -5 if rejected
   - Tag: `peace_offering`

3. "My cafe has heart, and that's something money can't buy."
   - Next: `philosophical_debate`
   - Effect: +7 friendship, unlocks special dialogue
   - Tag: `values_clash`

---

### 4. Romance Option Dialogue (romance_sarah)

**Dialogue ID**: `romance_sarah`
**Chapter**: Special scenes
**Characters**: Alex, Sarah

**Requirements**:
- 60+ friendship with Sarah
- Complete "coffee_training" choice
- Sarah is romanceable (set in CharacterManager)

```csharp
// Dialogue Line 1
Character: Sarah
Text: "Alex... can I talk to you about something? It's been amazing watching you build this cafe from scratch."
Expression: nervous
Sprite: sarah_nervous

// Dialogue Line 2
Character: Alex
Text: "Of course, Sarah! You've been my rock through all of this. What's on your mind?"
Expression: concerned
Sprite: alex_concerned

// Dialogue Line 3
Character: Sarah
Text: "It's just... I've always seen you as more than a friend. Working this closely with you every day... I think I'm falling for you."
Expression: vulnerable
Sprite: sarah_vulnerable

// Dialogue Line 4
Character: Alex
Text: "Sarah... I... I don't know what to say. I value our friendship so much, but..."
Expression: flustered
Sprite: alex_flustered
```

**Choices**:
1. "I feel the same way. I've just been too afraid to admit it."
   - Next: `romance_accepted`
   - Effect: +20 romance, unlock romance route
   - Tag: `romance_yes`

2. "I treasure our friendship, but I don't see you that way."
   - Next: `romance_rejected`
   - Effect: -10 friendship, -5 romance, maintain friendship
   - Tag: `romance_no`

3. "Can I have some time to think about this? This is important."
   - Next: `romance_delayed`
   - Effect: No immediate change, continue friendship
   - Tag: `romance_think`

---

## Character Relationship Data

### Sarah (Best Friend/Barista)
- **Initial Friendship**: 20 (already friends)
- **Romanceable**: Yes
- **Favorite Topics**: Coffee, fashion, 2000s nostalgia
- **Disliked Topics**: Minimalist design, corporate coffee chains
- **Favorite Cafe Item**: Vanilla latte with extra foam

### Jessica (Rival)
- **Initial Friendship**: 0
- **Romanceable**: No (business focus)
- **Favorite Topics**: Business, competition, quality
- **Disliked Topics**: "Fluff", nostalgia, cute aesthetics
- **Favorite Cafe Item**: Black coffee, no sugar

### Mike (Regular Customer)
- **Initial Friendship**: 0
- **Romanceable**: Yes (optional route)
- **Favorite Topics**: 2000s nostalgia, video games, movies
- **Disliked Topics**: Politics, serious topics
- **Favorite Cafe Item**: Vanilla latte

### Emma (Fashionista Customer)
- **Initial Friendship**: 0
- **Romanceable**: Yes (fashion route)
- **Favorite Topics**: Fashion, shopping, social media
- **Disliked Topics**: Cheap items, outdated styles
- **Favorite Cafe Item**: Matcha latte with oat milk

## Testing Instructions

1. **Create DialogueData Assets**:
   - Right-click in Project window > Create > Cafe Visual Novel > Dialogue Data
   - Name them: `intro_dialogue`, `first_customer_dialogue`, `meet_rival_dialogue`, `romance_sarah_dialogue`

2. **Fill in the data**:
   - Use the content above to fill in the DialogueData fields
   - Assign character sprites (use placeholders for now)

3. **Set up DialogueLoader**:
   - Add all dialogue assets to the "allDialogues" array
   - Set startDialogueID to "intro"

4. **Test different paths**:
   - Make different choices to see relationship changes
   - Check that requirements work correctly
   - Verify save/load functionality

---
*These samples provide a foundation for testing the dialogue system and can be expanded for the full game*