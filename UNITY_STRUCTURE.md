# Unity Project Structure

## Folder Organization
```
cafe-visual-novel/
├── Assets/
│   ├── Scripts/
│   │   ├── DialogueSystem/
│   │   │   ├── DialogueManager.cs
│   │   │   ├── DialogueData.cs
│   │   │   ├── ChoiceHandler.cs
│   │   │   └── CharacterManager.cs
│   │   ├── CafeMechanics/
│   │   │   ├── OrderManager.cs
│   │   │   ├── CustomerAI.cs
│   │   │   ├── ServingMiniGame.cs
│   │   │   └── ScoreSystem.cs
│   │   ├── UI/
│   │   │   ├── DialogueUI.cs
│   │   │   ├── CafeUI.cs
│   │   │   └── MenuNavigation.cs
│   │   ├── SceneManagement/
│   │   │   ├── SceneManager.cs
│   │   │   └── GameProgress.cs
│   │   └── Data/
│   │       ├── CharacterData.cs
│   │       ├── StoryProgress.cs
│   │       └── SaveSystem.cs
│   ├── Art/
│   │   ├── Characters/
│   │   │   ├── MainCharacter/
│   │   │   ├── SupportingCast/
│   │   │   └── Customers/
│   │   ├── Backgrounds/
│   │   │   ├── CafeInterior/
│   │   │   ├── Kitchen/
│   │   │   └── Outdoor/
│   │   └── UI/
│   │       ├── Buttons/
│   │       ├── Panels/
│   │       └── Icons/
│   ├── Audio/
│   │   ├── Music/
│   │   ├── SFX/
│   │   └── VoiceLines/
│   ├── Scenes/
│   │   ├── MainScene.unity
│   │   ├── CafeScene.unity
│   │   ├── DialogueScene.unity
│   │   └── MenuScene.unity
│   ├── Prefabs/
│   │   ├── Characters/
│   │   ├── UI/
│   │   └── CafeItems/
│   └── Data/
│       ├── DialogueFiles/
│       ├── CharacterStats/
│       └── GameSettings/
├── Packages/
├── ProjectSettings/
└── Documentation/
```

## Key Scripts Architecture

### Dialogue System
- **DialogueManager**: Handle dialogue display and flow
- **DialogueData**: ScriptableObjects for dialogue content
- **ChoiceHandler**: Process player choices
- **CharacterManager**: Track character relationships

### Cafe Mechanics
- **OrderManager**: Handle customer orders and timing
- **CustomerAI**: Control customer behavior and patience
- **ServingMiniGame**: Manage serving gameplay
- **ScoreSystem**: Track performance and money

### Integration Layer
- **GameProgress**: Bridge story and gameplay progress
- **SceneManager**: Handle transitions between modes
- **SaveSystem**: Persistent data management

## Unity Setup Considerations
- **Canvas Scaling**: Responsive for different screen sizes
- **Input System**: Touch for mobile, mouse for web
- **Performance Optimization**: Sprite atlases, object pooling
- **WebGL Settings**: Compression settings for GitHub Pages

## Development Phases
1. **Phase 1**: Basic dialogue system
2. **Phase 2**: Simple cafe mechanics
3. **Phase 3**: Story integration
4. **Phase 4**: Polish and optimization
5. **Phase 5**: Multi-platform deployment

---
*Structure designed for scalability and maintainability*