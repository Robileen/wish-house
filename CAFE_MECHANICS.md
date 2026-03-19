# Cafe Serving Mechanics - Integration Plan

## Core Gameplay Loop

### 1. Story-to-Gameplay Transitions
```
Story Scene → Dialogue Choice → "Let's work at the cafe!" → Cafe Gameplay → Results → Story Continues
```

### 2. Cafe Mechanics Overview
- **Order Taking**: Customer approaches, player takes order
- **Preparation**: Simple mini-games for making items
- **Service**: Deliver to correct customer
- **Payment**: Earn money/story points
- **Time Limits**: Customer patience meters

## Key Components

### OrderManager.cs
```csharp
public class OrderManager : MonoBehaviour
{
    [System.Serializable]
    public class Order
    {
        public string customerName;
        public string[] items;
        public float patienceTime;
        public int payment;
        public string dialogueTrigger; // Unlocks after serving
    }
    
    public List<Order> possibleOrders;
    public List<Transform> customerSpots;
    
    public void SpawnCustomer()
    {
        // Select random order based on story progress
        var order = GetOrderForCurrentChapter();
        var spot = GetAvailableSpot();
        
        // Spawn customer and start order
        InstantiateCustomer(order, spot);
    }
    
    private Order GetOrderForCurrentChapter()
    {
        // Filter orders based on story progress
        var availableOrders = possibleOrders.Where(o => 
            o.requiredChapter <= gameProgress.currentChapter).ToList();
        
        return availableOrders[Random.Range(0, availableOrders.Count)];
    }
}
```

### ServingMiniGame.cs
```csharp
public class ServingMiniGame : MonoBehaviour
{
    [Header("Gameplay Settings")]
    public float gameTime = 120f; // 2 minutes per shift
    public int targetScore = 100;
    
    [Header("Story Integration")]
    public DialogueData preShiftDialogue;
    public DialogueData postShiftDialogue;
    
    private int currentScore;
    private int customersServed;
    private bool isPlaying;
    
    public void StartShift()
    {
        // Show pre-shift dialogue
        dialogueManager.StartDialogue(preShiftDialogue);
        
        // Start gameplay after dialogue
        StartCoroutine(StartGameplayAfterDialogue());
    }
    
    private IEnumerator StartGameplayAfterDialogue()
    {
        yield return new WaitWhile(() => dialogueManager.IsPlaying);
        
        isPlaying = true;
        currentScore = 0;
        customersServed = 0;
        
        // Start spawning customers
        customerSpawner.StartSpawning();
    }
    
    public void CompleteOrder(Order order, bool success)
    {
        if (success)
        {
            currentScore += order.payment;
            customersServed++;
            
            // Trigger story-related dialogue
            if (!string.IsNullOrEmpty(order.dialogueTrigger))
            {
                TriggerSpecialDialogue(order.dialogueTrigger);
            }
        }
        
        // Check for story progression
        CheckStoryProgress();
    }
}
```

### CustomerAI.cs
```csharp
public class CustomerAI : MonoBehaviour
{
    [Header("Behavior")]
    public float maxPatience = 60f;
    public float patienceDecreaseRate = 1f;
    
    [Header("Story Elements")]
    public string characterName;
    public DialogueData[] specialDialogues;
    public Sprite[] expressionSprites;
    
    private float currentPatience;
    private Order currentOrder;
    private bool isServed;
    
    public void ReceiveOrder(Order order)
    {
        currentOrder = order;
        currentPatience = maxPatience;
        
        // Show character-specific reaction
        ShowCharacterReaction("ordering");
    }
    
    private void Update()
    {
        if (!isServed && currentOrder != null)
        {
            currentPatience -= patienceDecreaseRate * Time.deltaTime;
            
            // Update expression based on patience
            UpdatePatienceExpression();
            
            if (currentPatience <= 0)
            {
                LeaveAngry();
            }
        }
    }
    
    private void UpdatePatienceExpression()
    {
        if (currentPatience > maxPatience * 0.6f)
            SetExpression("happy");
        else if (currentPatience > maxPatience * 0.3f)
            SetExpression("neutral");
        else
            SetExpression("impatient");
    }
}
```

## Story Integration Points

### 1. Character Development Through Service
- **Regular Customers**: Become friends through repeated service
- **Special Orders**: Unlock character backstories
- **Perfect Service**: Increases relationship levels
- **Failure States**: Affects character opinions

### 2. Plot Progression
```csharp
public class StoryRequirements
{
    // Chapter 1: Serve 10 customers perfectly
    // Chapter 2: Earn $500 to upgrade cafe
    // Chapter 3: Serve special character (rival cafe owner)
    // Chapter 4: Master all recipe mini-games
    // Chapter 5: Achieve 5-star rating
}
```

### 3. Narrative Consequences
- **Good Service**: Characters share gossip, tips, story info
- **Bad Service**: Characters get upset, affect relationships
- **Special Events**: Holidays, festivals affect cafe traffic
- **Choices Matter**: Which characters you serve well affects story branches

## Mini-Game Ideas

### 1. Coffee Making (Quick Time Events)
- **Sequence**: Press buttons in correct order
- **Timing**: Stop moving needle at right moment
- **Difficulty**: Increases with complex orders

### 2. Food Preparation (Pattern Matching)
- **Ingredients**: Select correct ingredients
- **Recipe**: Follow pattern shown briefly
- **Speed**: Bonus for quick completion

### 3. Customer Management (Prioritization)
- **Multiple Orders**: Handle 3-5 customers at once
- **Patience**: Balance attention between customers
- **Strategy**: Choose which orders to take first

## Progression System

### Cafe Upgrades
- **Equipment**: Better tools = easier mini-games
- **Decorations**: Attract better customers
- **Menu**: New items unlock new story content

### Character Unlocks
- **New Customers**: Reach relationship thresholds
- **Story Scenes**: Complete specific serving challenges
- **Endings**: Based on final cafe success and relationships

## Difficulty Scaling
- **Early Game**: Simple orders, patient customers
- **Mid Game**: Multiple orders, time pressure
- **Late Game**: Complex recipes, special events

---
*Balanced blend of narrative and gameplay for engaging experience*