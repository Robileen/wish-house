# Themed Menus

Drop themed recipe sets here as JSON files. Each theme file adds new recipes
that can be unlocked or activated during special events.

## File format

```json
{
  "id": "summer_festival",
  "name": "Summer Festival Menu",
  "description": "Limited-time tropical treats available during the Summer Festival event.",
  "unlockCondition": "Complete Chapter 3",
  "recipes": [
    {
      "id": "tropical_punch",
      "name": "Tropical Punch",
      "category": "drink",
      "icon": "",
      "ingredients": ["strawberry", "banana", "sugar", "cold"],
      "illustration": "A bright fruity punch with a tiny umbrella."
    }
  ]
}
```

## Fields

| Field             | Description                                         |
|-------------------|-----------------------------------------------------|
| `id`              | Unique theme identifier                             |
| `name`            | Display name for the menu                           |
| `description`     | Flavour text shown to the player                    |
| `unlockCondition` | How the player unlocks this set (free-text for now) |
| `recipes`         | Array of recipe objects (same schema as other files) |
