using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace WishHouse.Journal
{
    /// <summary>
    /// Renders the Journal Book UI: scrapbook pages with washi tape episode strips.
    /// This is the main menu hub of the game. Players navigate chapters and tap
    /// episode tapes to enter VN scenes or cafe gameplay.
    /// </summary>
    public class JournalUI : MonoBehaviour
    {
        [Header("Journal Book")]
        [SerializeField] private GameObject journalPanel;
        [SerializeField] private TextMeshProUGUI chapterTitle;
        [SerializeField] private TextMeshProUGUI chapterLocation;
        [SerializeField] private Transform episodeContainer;

        [Header("Washi Tape Prefab")]
        [SerializeField] private GameObject washiTapePrefab;

        [Header("Navigation")]
        [SerializeField] private Button prevChapterBtn;
        [SerializeField] private Button nextChapterBtn;
        [SerializeField] private TextMeshProUGUI pageIndicator;

        [Header("Chapter Summary")]
        [SerializeField] private GameObject summaryPanel;
        [SerializeField] private TextMeshProUGUI memoriesText;
        [SerializeField] private Slider satisfactionSlider;

        [Header("Decorations")]
        [SerializeField] private GameObject[] stickerPrefabs;
        [SerializeField] private GameObject[] paperclipPrefabs;
        [SerializeField] private GameObject[] flowerPrefabs;

        private int _displayedChapter = 1;

        public event System.Action<int, int> OnEpisodeSelected; // chapter, episode

        private void Start()
        {
            if (prevChapterBtn != null)
                prevChapterBtn.onClick.AddListener(PrevChapter);
            if (nextChapterBtn != null)
                nextChapterBtn.onClick.AddListener(NextChapter);

            ShowChapter(1);
        }

        /// <summary>
        /// Show the journal book UI.
        /// </summary>
        public void Show()
        {
            if (journalPanel != null)
                journalPanel.SetActive(true);

            ShowChapter(_displayedChapter);
        }

        /// <summary>
        /// Hide the journal book UI.
        /// </summary>
        public void Hide()
        {
            if (journalPanel != null)
                journalPanel.SetActive(false);
        }

        /// <summary>
        /// Display a chapter's page with all its episode washi tapes.
        /// </summary>
        public void ShowChapter(int chapter)
        {
            _displayedChapter = chapter;

            var journalMgr = JournalManager.Instance;
            if (journalMgr == null) return;

            var chapterData = journalMgr.GetChapter(chapter);
            if (chapterData == null) return;

            // Set chapter header
            if (chapterTitle != null)
                chapterTitle.text = $"Chapter {chapter}";
            if (chapterLocation != null)
                chapterLocation.text = chapterData.location;
            if (pageIndicator != null)
                pageIndicator.text = $"{chapter} / 8";

            // Clear existing tapes
            if (episodeContainer != null)
            {
                foreach (Transform child in episodeContainer)
                    Destroy(child.gameObject);
            }

            // Create washi tape for each episode
            foreach (var episode in chapterData.episodes)
            {
                CreateWashiTape(chapter, episode);
            }

            // Update summary
            UpdateSummary(chapterData);

            // Navigation buttons
            if (prevChapterBtn != null)
                prevChapterBtn.interactable = chapter > 1;
            if (nextChapterBtn != null)
                nextChapterBtn.interactable = chapter < 8;
        }

        /// <summary>
        /// Create a single washi tape strip for an episode.
        /// </summary>
        private void CreateWashiTape(int chapter, JournalEpisode episode)
        {
            if (washiTapePrefab == null || episodeContainer == null) return;

            var journalMgr = JournalManager.Instance;
            EpisodeState state = journalMgr.GetEpisodeState(chapter, episode.episode);
            WashiTapeConfig config = journalMgr.GetTapeConfig(chapter, episode.episode);

            GameObject tape = Instantiate(washiTapePrefab, episodeContainer);

            // Get UI elements from prefab
            var tapeImage = tape.GetComponent<Image>();
            var titleText = tape.GetComponentInChildren<TextMeshProUGUI>();
            var button = tape.GetComponent<Button>();

            // Apply tape color
            if (tapeImage != null)
                tapeImage.color = config.tapeColor;

            // Set title
            if (titleText != null)
            {
                switch (state)
                {
                    case EpisodeState.Locked:
                        titleText.text = $"Ep. {episode.episode} — ???";
                        titleText.alpha = 0.4f;
                        if (tapeImage != null)
                            tapeImage.color = new Color(0.85f, 0.85f, 0.85f, 0.5f);
                        break;

                    case EpisodeState.Unlocked:
                        titleText.text = $"Ep. {episode.episode} — {episode.title}";
                        break;

                    case EpisodeState.InProgress:
                        titleText.text = $"Ep. {episode.episode} — {episode.title}  (in progress)";
                        break;

                    case EpisodeState.Completed:
                        titleText.text = $"Ep. {episode.episode} — {episode.title}  \u2713";
                        break;
                }
            }

            // Episode type indicator
            var typeIndicator = tape.transform.Find("TypeIndicator");
            if (typeIndicator != null)
            {
                var typeText = typeIndicator.GetComponent<TextMeshProUGUI>();
                if (typeText != null)
                {
                    if (episode.IsShiftEpisode)
                        typeText.text = "VN + Shift";
                    else
                        typeText.text = "VN";
                }
            }

            // Magician sparkle overlay
            var sparkle = tape.transform.Find("MagicianSparkle");
            if (sparkle != null)
                sparkle.gameObject.SetActive(config.hasMagicianPresence && state != EpisodeState.Locked);

            // Button interaction
            if (button != null)
            {
                bool interactable = state == EpisodeState.Unlocked
                                 || state == EpisodeState.InProgress
                                 || state == EpisodeState.Completed;
                button.interactable = interactable;

                int ep = episode.episode; // Capture for closure
                button.onClick.AddListener(() => OnTapeTapped(chapter, ep));
            }

            // Add scrapbook decoration
            AddDecoration(tape.transform, config.decorationType);
        }

        private void OnTapeTapped(int chapter, int episode)
        {
            Debug.Log($"[JournalUI] Tapped Chapter {chapter}, Episode {episode}");
            OnEpisodeSelected?.Invoke(chapter, episode);
        }

        private void AddDecoration(Transform parent, string type)
        {
            GameObject[] prefabs = null;
            switch (type)
            {
                case "sticker":   prefabs = stickerPrefabs;   break;
                case "paperclip": prefabs = paperclipPrefabs; break;
                case "flower":    prefabs = flowerPrefabs;    break;
                default: return;
            }

            if (prefabs == null || prefabs.Length == 0) return;

            int idx = Random.Range(0, prefabs.Length);
            if (prefabs[idx] != null)
                Instantiate(prefabs[idx], parent);
        }

        private void UpdateSummary(JournalChapter chapter)
        {
            if (summaryPanel == null) return;

            var summary = chapter.summary;
            summaryPanel.SetActive(summary != null && summary.completed);

            if (memoriesText != null && summary != null)
                memoriesText.text = $"{summary.unlockedMemories} / {summary.totalMemories} Memories";

            if (satisfactionSlider != null && summary != null)
                satisfactionSlider.value = summary.customerSatisfaction;
        }

        private void PrevChapter()
        {
            if (_displayedChapter > 1)
                ShowChapter(_displayedChapter - 1);
        }

        private void NextChapter()
        {
            if (_displayedChapter < 8)
                ShowChapter(_displayedChapter + 1);
        }
    }
}
