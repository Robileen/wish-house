using System.Collections.Generic;
using UnityEngine;
using WishHouse.Data;

namespace WishHouse.Journal
{
    /// <summary>
    /// Manages journal state: loading chapter data, tracking episode unlock/completion,
    /// and coordinating with GameManager for save/load.
    /// </summary>
    public class JournalManager : MonoBehaviour
    {
        public static JournalManager Instance { get; private set; }

        [Header("Data")]
        [SerializeField] private TextAsset[] chapterSpecFiles;

        private Dictionary<int, JournalChapter> _chapters = new Dictionary<int, JournalChapter>();
        private JournalProgress _progress;

        public JournalProgress Progress => _progress;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            LoadChapterSpecs();
            _progress = LoadProgress();
            InitializeEpisodeStates();
        }

        /// <summary>
        /// Load chapter spec JSONs (e.g. chapter1_episodelist_spec.json).
        /// </summary>
        private void LoadChapterSpecs()
        {
            if (chapterSpecFiles == null) return;

            foreach (var file in chapterSpecFiles)
            {
                if (file == null) continue;

                var spec = JsonUtility.FromJson<ChapterSpec>(file.text);
                if (spec == null) continue;

                var chapter = new JournalChapter
                {
                    chapter = spec.chapter,
                    location = GetChapterLocation(spec.chapter),
                    episodes = new List<JournalEpisode>(),
                    summary = new ChapterSummary()
                };

                foreach (var ep in spec.episodes)
                {
                    chapter.episodes.Add(new JournalEpisode
                    {
                        episode = ep.episode,
                        title = ep.title,
                        shiftId = ep.shiftId > 0 ? ep.shiftId : (int?)null,
                        type = ep.type,
                        pov = ep.pov != null ? new List<string>(ep.pov) : new List<string>(),
                        scene = ep.scene,
                        unlock = ep.unlock
                    });
                }

                _chapters[spec.chapter] = chapter;
            }

            Debug.Log($"[JournalManager] Loaded {_chapters.Count} chapter(s)");
        }

        /// <summary>
        /// Initialize episode unlock states. Episode 1 of Chapter 1 is always unlocked.
        /// Subsequent episodes unlock when the previous one is completed.
        /// </summary>
        private void InitializeEpisodeStates()
        {
            if (_progress.episodeStates == null)
                _progress.episodeStates = new List<EpisodeProgress>();

            foreach (var kvp in _chapters)
            {
                int ch = kvp.Key;
                var chapter = kvp.Value;

                foreach (var ep in chapter.episodes)
                {
                    if (!HasEpisodeProgress(ch, ep.episode))
                    {
                        var epProgress = new EpisodeProgress
                        {
                            chapter = ch,
                            episode = ep.episode,
                            state = (ch == 1 && ep.episode == 1)
                                ? EpisodeState.Unlocked
                                : EpisodeState.Locked
                        };
                        _progress.episodeStates.Add(epProgress);
                    }
                }
            }
        }

        // ── Public API ──

        /// <summary>
        /// Get chapter data by number.
        /// </summary>
        public JournalChapter GetChapter(int chapter)
        {
            _chapters.TryGetValue(chapter, out JournalChapter ch);
            return ch;
        }

        /// <summary>
        /// Get the episode state (locked/unlocked/completed).
        /// </summary>
        public EpisodeState GetEpisodeState(int chapter, int episode)
        {
            var ep = GetEpisodeProgress(chapter, episode);
            return ep?.state ?? EpisodeState.Locked;
        }

        /// <summary>
        /// Mark an episode as completed and unlock the next one.
        /// </summary>
        public void CompleteEpisode(int chapter, int episode)
        {
            var ep = GetEpisodeProgress(chapter, episode);
            if (ep == null) return;

            ep.state = EpisodeState.Completed;

            // Unlock next episode
            var nextEp = GetEpisodeProgress(chapter, episode + 1);
            if (nextEp != null && nextEp.state == EpisodeState.Locked)
            {
                nextEp.state = EpisodeState.Unlocked;
                Debug.Log($"[JournalManager] Unlocked Chapter {chapter}, Episode {episode + 1}");
            }

            // Check if chapter is complete
            CheckChapterCompletion(chapter);

            SaveProgress();
        }

        /// <summary>
        /// Mark an episode as in-progress.
        /// </summary>
        public void StartEpisode(int chapter, int episode)
        {
            var ep = GetEpisodeProgress(chapter, episode);
            if (ep != null && ep.state == EpisodeState.Unlocked)
            {
                ep.state = EpisodeState.InProgress;
                SaveProgress();
            }
        }

        /// <summary>
        /// Get the washi tape visual config for an episode.
        /// </summary>
        public WashiTapeConfig GetTapeConfig(int chapter, int episode)
        {
            var chapterData = GetChapter(chapter);
            if (chapterData == null) return DefaultTapeConfig();

            JournalEpisode epData = chapterData.episodes.Find(e => e.episode == episode);
            if (epData == null) return DefaultTapeConfig();

            return new WashiTapeConfig
            {
                tapeColor = GetTapeColor(episode),
                npcSketchId = GetNpcSketch(epData),
                hasMagicianPresence = epData.pov != null && epData.pov.Contains("wizard"),
                decorationType = GetDecorationType(episode)
            };
        }

        // ── Helpers ──

        private EpisodeProgress GetEpisodeProgress(int chapter, int episode)
        {
            return _progress.episodeStates?.Find(
                e => e.chapter == chapter && e.episode == episode
            );
        }

        private bool HasEpisodeProgress(int chapter, int episode)
        {
            return GetEpisodeProgress(chapter, episode) != null;
        }

        private void CheckChapterCompletion(int chapter)
        {
            var ch = GetChapter(chapter);
            if (ch == null) return;

            bool allDone = true;
            foreach (var ep in ch.episodes)
            {
                if (GetEpisodeState(chapter, ep.episode) != EpisodeState.Completed)
                {
                    allDone = false;
                    break;
                }
            }

            if (allDone)
            {
                ch.summary.completed = true;
                Debug.Log($"[JournalManager] Chapter {chapter} complete!");
            }
        }

        private string GetChapterLocation(int chapter)
        {
            switch (chapter)
            {
                case 1: return "Wish House";
                default: return $"Chapter {chapter}";
            }
        }

        private Color GetTapeColor(int episode)
        {
            Color[] palette = {
                new Color(0.96f, 0.73f, 0.76f), // Blush pink
                new Color(0.78f, 0.91f, 0.82f), // Pale mint
                new Color(0.99f, 0.86f, 0.73f), // Soft peach
                new Color(0.83f, 0.66f, 0.83f), // Lavender
                new Color(0.96f, 0.90f, 0.64f), // Soft yellow
                new Color(0.73f, 0.83f, 0.96f), // Baby blue
                new Color(0.93f, 0.79f, 0.69f), // Milk tea
                new Color(0.85f, 0.75f, 0.85f), // Dusty rose
            };
            return palette[(episode - 1) % palette.Length];
        }

        private string GetNpcSketch(JournalEpisode ep)
        {
            if (ep.pov == null || ep.pov.Count == 0) return null;
            return ep.pov[0]; // Primary POV character
        }

        private string GetDecorationType(int episode)
        {
            string[] types = { "sticker", "paperclip", "flower", "none", "sticker", "flower", "paperclip", "sticker" };
            return types[(episode - 1) % types.Length];
        }

        private WashiTapeConfig DefaultTapeConfig()
        {
            return new WashiTapeConfig
            {
                tapeColor = new Color(0.9f, 0.9f, 0.9f),
                decorationType = "none"
            };
        }

        // ── Save/Load ──

        private const string JOURNAL_SAVE_KEY = "WishHouse_Journal";

        public void SaveProgress()
        {
            string json = JsonUtility.ToJson(_progress);
            PlayerPrefs.SetString(JOURNAL_SAVE_KEY, json);
            PlayerPrefs.Save();
        }

        private JournalProgress LoadProgress()
        {
            if (PlayerPrefs.HasKey(JOURNAL_SAVE_KEY))
            {
                string json = PlayerPrefs.GetString(JOURNAL_SAVE_KEY);
                return JsonUtility.FromJson<JournalProgress>(json);
            }
            return new JournalProgress();
        }

        public void ResetProgress()
        {
            PlayerPrefs.DeleteKey(JOURNAL_SAVE_KEY);
            _progress = new JournalProgress();
            InitializeEpisodeStates();
        }
    }

    /// <summary>
    /// Internal class for deserializing chapter spec JSON.
    /// </summary>
    [System.Serializable]
    internal class ChapterSpec
    {
        public int chapter;
        public List<ChapterSpecEpisode> episodes;
    }

    [System.Serializable]
    internal class ChapterSpecEpisode
    {
        public int episode;
        public string title;
        public int shiftId;
        public string type;
        public string[] pov;
        public string scene;
        public string unlock;
    }
}
