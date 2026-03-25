using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using WishHouse.Data;

namespace WishHouse.Dialogue
{
    /// <summary>
    /// Core dialogue manager. Drives the visual novel dialogue flow:
    /// displays lines with typewriter effect, handles speaker changes,
    /// triggers choices, and manages scene transitions.
    /// </summary>
    public class DialogueManager : MonoBehaviour
    {
        public static DialogueManager Instance { get; private set; }

        [Header("Settings")]
        [SerializeField] private float typewriterSpeed = 0.03f;
        [SerializeField] private float autoAdvanceDelay = 1.5f;

        // Dependencies (assign in Inspector or via code)
        private DialogueUI _dialogueUI;
        private ChoiceHandler _choiceHandler;
        private DialogueLoader _loader;

        // State
        private EpisodeBlock _currentBlock;
        private int _currentLineIndex;
        private bool _isTyping;
        private bool _skipRequested;
        private Coroutine _typewriterCoroutine;

        public event Action<DialogueLine> OnLineDisplayed;
        public event Action<Choice> OnChoicePresented;
        public event Action<SceneTransition> OnSceneTransition;
        public event Action OnDialogueComplete;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            _dialogueUI = GetComponentInChildren<DialogueUI>();
            _choiceHandler = GetComponentInChildren<ChoiceHandler>();
            _loader = GetComponentInChildren<DialogueLoader>();

            // Fallback: search the entire scene if not found on this GameObject
            if (_dialogueUI == null) _dialogueUI = FindObjectOfType<DialogueUI>();
            if (_choiceHandler == null) _choiceHandler = FindObjectOfType<ChoiceHandler>();
            if (_loader == null) _loader = FindObjectOfType<DialogueLoader>();
        }

        /// <summary>
        /// Start playing an episode block (e.g. "1", "1.1", "1.2").
        /// </summary>
        public void StartBlock(EpisodeBlock block)
        {
            // Stop any in-progress typewriter from a previous block
            if (_typewriterCoroutine != null)
                StopCoroutine(_typewriterCoroutine);

            _currentBlock = block;
            _currentLineIndex = 0;
            _isTyping = false;
            _skipRequested = false;

            if (_dialogueUI != null)
                _dialogueUI.Show();

            DisplayNextLine();
        }

        /// <summary>
        /// Load and start a full episode from JSON.
        /// </summary>
        public void StartEpisode(int chapter, int episode, string blockKey = null)
        {
            if (_loader == null)
            {
                Debug.LogError("[DialogueManager] DialogueLoader is null! Cannot load episode.");
                return;
            }

            EpisodeData data = _loader.LoadEpisode(chapter, episode);
            if (data == null)
            {
                Debug.LogError($"[DialogueManager] LoadEpisode returned null for Ch{chapter} Ep{episode}");
                return;
            }

            // Default block key is the episode number (e.g. episode 2 → "2")
            if (string.IsNullOrEmpty(blockKey))
                blockKey = episode.ToString();

            Debug.Log($"[DialogueManager] Starting Ch{chapter} Ep{episode}, blockKey='{blockKey}', available keys: [{string.Join(", ", data.episodes.Keys)}]");

            if (data.episodes.TryGetValue(blockKey, out EpisodeBlock block))
            {
                StartBlock(block);
            }
            else
            {
                Debug.LogError($"[DialogueManager] Block '{blockKey}' not found in Ch{chapter} Ep{episode}");
            }
        }

        /// <summary>
        /// Advance to the next line. Called by player input (click/tap).
        /// </summary>
        public void Advance()
        {
            if (_isTyping)
            {
                _skipRequested = true;
                return;
            }

            DisplayNextLine();
        }

        private void DisplayNextLine()
        {
            if (_currentBlock == null) return;

            // Check if we've reached the end of dialogue lines
            if (_currentLineIndex >= _currentBlock.dialogueLines.Count)
            {
                OnDialogueLinesComplete();
                return;
            }

            DialogueLine line = _currentBlock.dialogueLines[_currentLineIndex];
            _currentLineIndex++;

            // Update UI
            if (_dialogueUI != null)
            {
                _dialogueUI.SetSpeaker(line.speaker);
                _dialogueUI.SetExpression(line.speaker, line.expression);

                // Handle special speakers
                bool isNarrator = line.speaker == "Narrator";
                bool isStage = line.speaker == "Stage";
                _dialogueUI.SetNarratorMode(isNarrator || isStage);
            }

            // Start typewriter effect
            if (_typewriterCoroutine != null)
                StopCoroutine(_typewriterCoroutine);

            _typewriterCoroutine = StartCoroutine(TypewriterEffect(line.text));

            OnLineDisplayed?.Invoke(line);
        }

        private IEnumerator TypewriterEffect(string fullText)
        {
            _isTyping = true;
            _skipRequested = false;
            string displayed = "";

            foreach (char c in fullText)
            {
                if (_skipRequested)
                {
                    if (_dialogueUI != null)
                        _dialogueUI.SetDialogueText(fullText);
                    break;
                }

                displayed += c;
                if (_dialogueUI != null)
                    _dialogueUI.SetDialogueText(displayed);

                yield return new WaitForSeconds(typewriterSpeed);
            }

            _isTyping = false;
        }

        private void OnDialogueLinesComplete()
        {
            // Present choices if available
            if (_currentBlock.choices != null && _currentBlock.choices.Count > 0)
            {
                Choice choice = _currentBlock.choices[0];
                if (_dialogueUI != null)
                    _dialogueUI.SetDialogueText(choice.prompt);

                if (_choiceHandler != null)
                    _choiceHandler.PresentChoice(choice);

                OnChoicePresented?.Invoke(choice);
                return;
            }

            // Trigger scene transition if available
            if (_currentBlock.sceneTransition != null)
            {
                OnSceneTransition?.Invoke(_currentBlock.sceneTransition);
            }

            if (_dialogueUI != null)
                _dialogueUI.Hide();

            OnDialogueComplete?.Invoke();
        }

        /// <summary>
        /// Called by ChoiceHandler when player selects an option.
        /// Navigates to the target block.
        /// </summary>
        public void OnChoiceSelected(NavigationTarget target)
        {
            // Format block key with invariant culture so 2.1 is always "2.1", not "2,1"
            string blockKey = target.episode.ToString(System.Globalization.CultureInfo.InvariantCulture);
            int episodeInt = (int)target.episode;

            // Try to find the block in current episode data
            // The choice might point to a sub-block like "1.1"
            if (_loader != null)
            {
                EpisodeData data = _loader.LoadEpisode(target.chapter, episodeInt);
                if (data != null && data.episodes.TryGetValue(blockKey, out EpisodeBlock block))
                {
                    StartBlock(block);
                    return;
                }
            }

            Debug.LogWarning($"[DialogueManager] Could not navigate to Ch{target.chapter} Ep{target.episode}");
        }
    }
}
