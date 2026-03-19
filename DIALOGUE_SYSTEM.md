# C# Dialogue System Architecture

## Core Components

### 1. DialogueData.cs (ScriptableObject)
```csharp
[CreateAssetMenu(fileName = "DialogueData", menuName = "Game/Dialogue Data")]
public class DialogueData : ScriptableObject
{
    [System.Serializable]
    public class DialogueLine
    {
        public string characterName;
        public string text;
        public Sprite characterSprite;
        public AudioClip voiceClip;
        public float displayDuration;
    }
    
    [System.Serializable]
    public class Choice
    {
        public string choiceText;
        public int nextDialogueIndex;
        public string choiceTag; // For tracking player decisions
        public int relationshipChange; // Character relationship impact
    }
    
    public DialogueLine[] dialogueLines;
    public Choice[] choices;
    public string sceneToLoad;
    public bool isCafeTrigger; // Triggers cafe gameplay
}
```

### 2. DialogueManager.cs
```csharp
public class DialogueManager : MonoBehaviour
{
    [Header("UI References")]
    public TextMeshProUGUI dialogueText;
    public TextMeshProUGUI characterNameText;
    public Image characterImage;
    public GameObject[] choiceButtons;
    
    [Header("Settings")]
    public float textSpeed = 0.05f;
    
    private DialogueData currentDialogue;
    private int currentLineIndex;
    private bool isPlaying;
    
    public void StartDialogue(DialogueData dialogue)
    {
        currentDialogue = dialogue;
        currentLineIndex = 0;
        isPlaying = true;
        DisplayCurrentLine();
    }
    
    private void DisplayCurrentLine()
    {
        var line = currentDialogue.dialogueLines[currentLineIndex];
        characterNameText.text = line.characterName;
        characterImage.sprite = line.characterSprite;
        
        StartCoroutine(TypeText(line.text));
        
        if (currentLineIndex >= currentDialogue.dialogueLines.Length - 1)
        {
            ShowChoices();
        }
    }
    
    private IEnumerator TypeText(string text)
    {
        dialogueText.text = "";
        foreach (char c in text)
        {
            dialogueText.text += c;
            yield return new WaitForSeconds(textSpeed);
        }
    }
}
```

### 3. CharacterManager.cs
```csharp
public class CharacterManager : MonoBehaviour
{
    [System.Serializable]
    public class CharacterStats
    {
        public string characterName;
        public int friendshipLevel;
        public int romanceLevel;
        public bool hasMet;
        public List<string> unlockedScenes;
    }
    
    public List<CharacterStats> characters;
    
    public void UpdateRelationship(string characterName, int change, string type = "friendship")
    {
        var character = characters.Find(c => c.characterName == characterName);
        if (character != null)
        {
            if (type == "friendship")
                character.friendshipLevel += change;
            else if (type == "romance")
                character.romanceLevel += change;
                
            character.hasMet = true;
        }
    }
    
    public int GetRelationshipLevel(string characterName, string type = "friendship")
    {
        var character = characters.Find(c => c.characterName == characterName);
        return character != null ? 
            (type == "friendship" ? character.friendshipLevel : character.romanceLevel) : 0;
    }
}
```

### 4. ChoiceHandler.cs
```csharp
public class ChoiceHandler : MonoBehaviour
{
    private DialogueManager dialogueManager;
    private CharacterManager characterManager;
    private GameProgress gameProgress;
    
    private void Start()
    {
        dialogueManager = FindObjectOfType<DialogueManager>();
        characterManager = FindObjectOfType<CharacterManager>();
        gameProgress = FindObjectOfType<GameProgress>();
    }
    
    public void MakeChoice(int choiceIndex)
    {
        var choice = dialogueManager.CurrentDialogue.choices[choiceIndex];
        
        // Track player choice
        gameProgress.RecordChoice(choice.choiceTag);
        
        // Update relationships
        if (choice.relationshipChange != 0)
        {
            string characterName = dialogueManager.CurrentDialogue.dialogueLines[0].characterName;
            characterManager.UpdateRelationship(characterName, choice.relationshipChange);
        }
        
        // Handle next action
        if (choice.sceneToLoad != null)
        {
            SceneManager.LoadScene(choice.sceneToLoad);
        }
        else if (choice.nextDialogueIndex >= 0)
        {
            dialogueManager.StartDialogue(GetDialogueByIndex(choice.nextDialogueIndex));
        }
        else if (dialogueManager.CurrentDialogue.isCafeTrigger)
        {
            StartCafeGameplay();
        }
    }
}
```

## Integration with Cafe Mechanics

### GameProgress.cs (Bridge System)
```csharp
public class GameProgress : MonoBehaviour
{
    [System.Serializable]
    public class StoryChapter
    {
        public string chapterName;
        public bool isCompleted;
        public int requiredCafeLevel;
        public DialogueData chapterDialogue;
    }
    
    public List<StoryChapter> storyChapters;
    public List<string> playerChoices;
    public int currentChapter;
    
    public void CompleteCafeLevel(int score)
    {
        // Check if score unlocks new story content
        if (score >= GetRequiredScore(currentChapter))
        {
            UnlockNextChapter();
        }
    }
    
    public void RecordChoice(string choiceTag)
    {
        playerChoices.Add(choiceTag);
        // Certain choices affect cafe gameplay
        ApplyChoiceEffects(choiceTag);
    }
}
```

## Dialogue File Format
- JSON or ScriptableObject based
- Supports branching paths
- Character expression changes
- Voice line integration
- Conditional dialogue based on relationships

## Features to Implement
1. **Auto-save progress** after major choices
2. **Skip dialogue** for replay
3. **Log system** to review past conversations
4. **Conditional dialogue** based on stats
5. **Voice line integration** for immersion

---
*System designed for flexibility and easy content updates*