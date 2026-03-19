using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using WishHouse.Data;

namespace WishHouse.Dialogue
{
    /// <summary>
    /// Handles all dialogue UI rendering: speaker name, dialogue text,
    /// character sprites, choice buttons, and transitions.
    /// Character names displayed as: "Kit (Wizard)", "Edward (Barista)", "Claire"
    /// </summary>
    public class DialogueUI : MonoBehaviour
    {
        [Header("Dialogue Panel")]
        [SerializeField] private GameObject dialoguePanel;
        [SerializeField] private TextMeshProUGUI speakerNameText;
        [SerializeField] private TextMeshProUGUI dialogueText;
        [SerializeField] private Image speakerPortrait;
        [SerializeField] private GameObject advanceIndicator;

        [Header("Choice Panel")]
        [SerializeField] private GameObject choicePanel;
        [SerializeField] private GameObject choiceButtonPrefab;
        [SerializeField] private Transform choiceButtonContainer;

        [Header("Narrator Panel")]
        [SerializeField] private GameObject narratorPanel;
        [SerializeField] private TextMeshProUGUI narratorText;

        [Header("Character Sprites")]
        [SerializeField] private Image leftCharacterSprite;
        [SerializeField] private Image rightCharacterSprite;

        // Speaker-to-color mapping for name display
        private static readonly Dictionary<string, Color> SpeakerColors = new Dictionary<string, Color>
        {
            { "Kit (Wizard)",     new Color(0.85f, 0.65f, 0.13f) },  // Gold
            { "Edward (Barista)", new Color(0.55f, 0.27f, 0.07f) },  // Cocoa brown
            { "Claire",           new Color(0.78f, 0.56f, 0.65f) },  // Dusty rose
            { "Narrator",         new Color(0.75f, 0.75f, 0.75f) },  // Soft grey
            { "Stage",            new Color(0.6f,  0.6f,  0.6f)  },  // Muted grey
        };

        private Action<int> _onChoiceSelected;
        private bool _isNarratorMode;

        public void Show()
        {
            if (dialoguePanel != null)
                dialoguePanel.SetActive(true);

            HideChoices();
        }

        public void Hide()
        {
            if (dialoguePanel != null)
                dialoguePanel.SetActive(false);

            HideChoices();
        }

        /// <summary>
        /// Set the speaker name label. Uses formatted names like "Kit (Wizard)".
        /// </summary>
        public void SetSpeaker(string speaker)
        {
            if (speakerNameText == null) return;

            if (speaker == "Narrator" || speaker == "Stage")
            {
                speakerNameText.text = "";
                return;
            }

            speakerNameText.text = speaker;

            // Apply speaker color
            if (SpeakerColors.TryGetValue(speaker, out Color color))
                speakerNameText.color = color;
            else
                speakerNameText.color = Color.white;
        }

        /// <summary>
        /// Set the main dialogue text content.
        /// </summary>
        public void SetDialogueText(string text)
        {
            if (_isNarratorMode && narratorText != null)
            {
                narratorText.text = text;
            }
            else if (dialogueText != null)
            {
                dialogueText.text = text;
            }
        }

        /// <summary>
        /// Toggle between narrator/stage direction mode and character dialogue mode.
        /// </summary>
        public void SetNarratorMode(bool isNarrator)
        {
            _isNarratorMode = isNarrator;

            if (narratorPanel != null)
                narratorPanel.SetActive(isNarrator);

            // Dim character sprites during narration
            if (leftCharacterSprite != null)
                leftCharacterSprite.color = isNarrator ? new Color(1, 1, 1, 0.5f) : Color.white;
            if (rightCharacterSprite != null)
                rightCharacterSprite.color = isNarrator ? new Color(1, 1, 1, 0.5f) : Color.white;
        }

        /// <summary>
        /// Update character expression sprite.
        /// </summary>
        public void SetExpression(string speaker, string expression)
        {
            if (string.IsNullOrEmpty(expression)) return;

            // Load sprite from Resources/Characters/{characterId}/{expression}
            string characterId = GetCharacterId(speaker);
            if (characterId == null) return;

            string spritePath = $"Characters/{characterId}/{expression}";
            Sprite sprite = Resources.Load<Sprite>(spritePath);

            if (sprite == null) return;

            // Kit appears on left, others on right
            if (characterId == "kit" && leftCharacterSprite != null)
            {
                leftCharacterSprite.sprite = sprite;
                leftCharacterSprite.color = Color.white;
            }
            else if (rightCharacterSprite != null)
            {
                rightCharacterSprite.sprite = sprite;
                rightCharacterSprite.color = Color.white;
            }
        }

        /// <summary>
        /// Display choice buttons for player to select from.
        /// </summary>
        public void ShowChoices(List<ChoiceOption> options, Action<int> onSelected)
        {
            if (choicePanel == null || choiceButtonPrefab == null) return;

            _onChoiceSelected = onSelected;

            // Clear existing buttons
            foreach (Transform child in choiceButtonContainer)
                Destroy(child.gameObject);

            choicePanel.SetActive(true);

            for (int i = 0; i < options.Count; i++)
            {
                int index = i; // Capture for closure
                GameObject btn = Instantiate(choiceButtonPrefab, choiceButtonContainer);
                TextMeshProUGUI btnText = btn.GetComponentInChildren<TextMeshProUGUI>();
                if (btnText != null)
                    btnText.text = options[i].text;

                Button button = btn.GetComponent<Button>();
                if (button != null)
                    button.onClick.AddListener(() => OnChoiceButtonClicked(index));
            }
        }

        public void HideChoices()
        {
            if (choicePanel != null)
                choicePanel.SetActive(false);
        }

        private void OnChoiceButtonClicked(int index)
        {
            HideChoices();
            _onChoiceSelected?.Invoke(index);
        }

        /// <summary>
        /// Map speaker display name to character asset ID.
        /// </summary>
        private string GetCharacterId(string speaker)
        {
            switch (speaker)
            {
                case "Kit (Wizard)":     return "kit";
                case "Edward (Barista)": return "edward";
                case "Claire":           return "claire";
                default:                 return null;
            }
        }
    }
}
