using System;
using System.Collections.Generic;
using UnityEngine;
using WishHouse.Data;

namespace WishHouse.Dialogue
{
    /// <summary>
    /// Handles player choice presentation and selection.
    /// Works with DialogueManager to branch the story.
    /// </summary>
    public class ChoiceHandler : MonoBehaviour
    {
        private Choice _currentChoice;
        private List<string> _choiceHistory = new List<string>();

        public event Action<ChoiceOption> OnOptionSelected;

        /// <summary>
        /// Display a choice to the player via the UI.
        /// </summary>
        public void PresentChoice(Choice choice)
        {
            _currentChoice = choice;

            DialogueUI dialogueUI = GetComponentInParent<DialogueUI>();
            if (dialogueUI == null)
                dialogueUI = FindObjectOfType<DialogueUI>();

            if (dialogueUI != null)
            {
                dialogueUI.ShowChoices(choice.options, OnPlayerSelectOption);
            }
            else
            {
                Debug.LogWarning("[ChoiceHandler] No DialogueUI found to display choices.");
            }
        }

        /// <summary>
        /// Called when the player selects a choice option.
        /// </summary>
        public void OnPlayerSelectOption(int optionIndex)
        {
            if (_currentChoice == null || optionIndex >= _currentChoice.options.Count)
            {
                Debug.LogError("[ChoiceHandler] Invalid choice selection.");
                return;
            }

            ChoiceOption selected = _currentChoice.options[optionIndex];

            // Record choice in history
            _choiceHistory.Add($"{_currentChoice.id}:{optionIndex}");

            Debug.Log($"[ChoiceHandler] Player chose: {selected.text}");

            OnOptionSelected?.Invoke(selected);

            // Navigate to next block
            if (selected.next != null && DialogueManager.Instance != null)
            {
                DialogueManager.Instance.OnChoiceSelected(selected.next);
            }
        }

        /// <summary>
        /// Get the history of all choices made this session.
        /// </summary>
        public List<string> GetChoiceHistory()
        {
            return new List<string>(_choiceHistory);
        }

        /// <summary>
        /// Check if a specific choice was made.
        /// </summary>
        public bool WasChoiceMade(string choiceId, int optionIndex)
        {
            return _choiceHistory.Contains($"{choiceId}:{optionIndex}");
        }

        public void ClearHistory()
        {
            _choiceHistory.Clear();
        }
    }
}
