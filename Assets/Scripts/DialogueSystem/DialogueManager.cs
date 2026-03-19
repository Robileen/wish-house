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
        }

        /// <summary>
        /// Start playing an episode block (e.g. "1", "1.1", "1.2").
        /// </summary>
        public void StartBlock(EpisodeBlock block)
        {
            _currentBlock = block;
            _currentLineIndex = 0;
            _skipRequested = false;

            if (_dialogueUI != null)
                _dialogueUI.Show();

            DisplayNextLine();
        }

        /// <summary>
        /// Load and start a full episode from JSON.
        /// </summary>
        public void StartEpisode(int chapter, int episode, string blockKey = "1")
        {
            EpisodeData data = _loader.LoadEpisode(chapter, episode);
            if (data == null) return;

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
            string blockKey = target.episode.ToString();

            // Try to find the block in current episode data
            // The choice might point to a sub-block like "1.1"
            if (_loader != null)
            {
                EpisodeData data = _loader.LoadEpisode(target.chapter, (int)target.episode);
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
