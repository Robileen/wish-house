using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using WishHouse.Data;
using WishHouse.Dialogue;

namespace WishHouse.Core
{
    /// <summary>
    /// Top-level game manager. Handles game state, episode progression,
    /// save/load, and coordinates between dialogue and gameplay systems.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game State")]
        [SerializeField] private int currentChapter = 1;
        [SerializeField] private int currentEpisode = 1;

        [Header("References")]
        [SerializeField] private DialogueManager dialogueManager;
        [SerializeField] private DialogueLoader dialogueLoader;

        // Player progress
        private GameProgress _progress;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            _progress = LoadProgress();
            currentChapter = _progress.chapter;
            currentEpisode = _progress.episode;
        }

        private void Start()
        {
            // Subscribe to dialogue events
            if (dialogueManager != null)
            {
                dialogueManager.OnSceneTransition += HandleSceneTransition;
                dialogueManager.OnDialogueComplete += HandleDialogueComplete;
            }

            // Start the game at saved progress
            StartEpisode(currentChapter, currentEpisode);
        }

        /// <summary>
        /// Start a specific episode.
        /// </summary>
        public void StartEpisode(int chapter, int episode)
        {
            currentChapter = chapter;
            currentEpisode = episode;

            Debug.Log($"[GameManager] Starting Chapter {chapter}, Episode {episode}");

            if (dialogueManager != null)
                dialogueManager.StartEpisode(chapter, episode);
        }

        /// <summary>
        /// Handle scene transition from dialogue system.
        /// </summary>
        private void HandleSceneTransition(SceneTransition transition)
        {
            if (transition?.next == null) return;

            Debug.Log($"[GameManager] Transitioning to Ch{transition.next.chapter} Ep{transition.next.episode} (effect: {transition.effect})");

            StartCoroutine(TransitionToEpisode(transition));
        }

        private IEnumerator TransitionToEpisode(SceneTransition transition)
        {
            // Apply transition effect delay
            float delay = transition.delayMs > 0 ? transition.delayMs / 1000f : 1f;
            yield return new WaitForSeconds(delay);

            // Save progress
            _progress.chapter = transition.next.chapter;
            _progress.episode = (int)transition.next.episode;
            SaveProgress();

            // Start next episode
            StartEpisode(transition.next.chapter, (int)transition.next.episode);
        }

        private void HandleDialogueComplete()
        {
            Debug.Log("[GameManager] Dialogue complete for current block.");
        }

        #region Save/Load

        private const string SAVE_KEY = "WishHouse_Progress";

        public void SaveProgress()
        {
            _progress.chapter = currentChapter;
            _progress.episode = currentEpisode;
            string json = JsonUtility.ToJson(_progress);
            PlayerPrefs.SetString(SAVE_KEY, json);
            PlayerPrefs.Save();
            Debug.Log($"[GameManager] Progress saved: Ch{currentChapter} Ep{currentEpisode}");
        }

        public GameProgress LoadProgress()
        {
            if (PlayerPrefs.HasKey(SAVE_KEY))
            {
                string json = PlayerPrefs.GetString(SAVE_KEY);
                return JsonUtility.FromJson<GameProgress>(json);
            }

            return new GameProgress { chapter = 1, episode = 1 };
        }

        public void ResetProgress()
        {
            PlayerPrefs.DeleteKey(SAVE_KEY);
            _progress = new GameProgress { chapter = 1, episode = 1 };
            currentChapter = 1;
            currentEpisode = 1;
        }

        #endregion
    }

    [System.Serializable]
    public class GameProgress
    {
        public int chapter;
        public int episode;
        public List<string> choiceHistory;
    }
}
