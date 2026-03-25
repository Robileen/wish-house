using System.Collections.Generic;
using UnityEngine;
using WishHouse.Data;

namespace WishHouse.Dialogue
{
    /// <summary>
    /// Loads episode dialogue JSON files from Resources/DialogueFiles/.
    /// Place JSON files at: Assets/Resources/DialogueFiles/Chapter{N}/Episode{N}/
    ///
    /// Supports two layouts:
    ///   1. Split files  – episode{N}_main_dialogue + episode{N}_{B}_dialogue per branch
    ///   2. Monolithic   – episode{N}_dialogue (legacy, used as fallback)
    /// </summary>
    public class DialogueLoader : MonoBehaviour
    {
        private Dictionary<string, EpisodeData> _cache = new Dictionary<string, EpisodeData>();

        [Tooltip("Maximum number of branch sub-episodes to scan per episode (1.1 … 1.N).")]
        [SerializeField] private int maxBranches = 9;

        /// <summary>
        /// Load an episode dialogue file by chapter and episode number.
        /// Tries split files first, then falls back to the monolithic file.
        /// </summary>
        public EpisodeData LoadEpisode(int chapter, int episode)
        {
            string key = $"ch{chapter}_ep{episode}";

            if (_cache.ContainsKey(key))
                return _cache[key];

            string folder = $"DialogueFiles/Chapter{chapter}/Episode{episode}";

            // --- Try split layout first (main + branch files) ---
            string mainPath = $"{folder}/episode{episode}_main_dialogue";
            TextAsset mainFile = Resources.Load<TextAsset>(mainPath);

            if (mainFile != null)
            {
                EpisodeData data = LoadSplitEpisode(mainFile, folder, episode);
                _cache[key] = data;
                Debug.Log($"[DialogueLoader] Loaded split Chapter {chapter}, Episode {episode} ({data.episodes?.Count ?? 0} blocks)");
                return data;
            }

            // --- Fallback: monolithic file ---
            string legacyPath = $"{folder}/episode{episode}_dialogue";
            TextAsset legacyFile = Resources.Load<TextAsset>(legacyPath);

            if (legacyFile == null)
            {
                Debug.LogError($"[DialogueLoader] Could not load: {legacyPath}");
                return null;
            }

            EpisodeData legacyData = JsonUtility.FromJson<EpisodeData>(legacyFile.text);
            _cache[key] = legacyData;

            Debug.Log($"[DialogueLoader] Loaded Chapter {chapter}, Episode {episode} ({legacyData.episodes?.Count ?? 0} blocks)");
            return legacyData;
        }

        /// <summary>
        /// Merge the main file and any branch files into a single EpisodeData.
        /// Branch files follow the naming convention: episode{N}_{B}_dialogue
        /// where B is the branch number (1, 2, 3, …).
        /// </summary>
        private EpisodeData LoadSplitEpisode(TextAsset mainFile, string folder, int episode)
        {
            EpisodeData merged = JsonUtility.FromJson<EpisodeData>(mainFile.text);
            if (merged.episodes == null)
                merged.episodes = new Dictionary<string, EpisodeBlock>();

            for (int b = 1; b <= maxBranches; b++)
            {
                string branchPath = $"{folder}/episode{episode}_{b}_dialogue";
                TextAsset branchFile = Resources.Load<TextAsset>(branchPath);

                if (branchFile == null)
                    continue;

                EpisodeData branchData = JsonUtility.FromJson<EpisodeData>(branchFile.text);
                if (branchData?.episodes == null)
                    continue;

                foreach (var kvp in branchData.episodes)
                {
                    if (!merged.episodes.ContainsKey(kvp.Key))
                    {
                        merged.episodes[kvp.Key] = kvp.Value;
                    }
                    else
                    {
                        Debug.LogWarning($"[DialogueLoader] Duplicate block key '{kvp.Key}' in branch file {branchPath}, skipping.");
                    }
                }
            }

            return merged;
        }

        /// <summary>
        /// Load raw JSON string (for web builds or custom loading).
        /// </summary>
        public EpisodeData LoadFromJson(string json)
        {
            return JsonUtility.FromJson<EpisodeData>(json);
        }

        public void ClearCache()
        {
            _cache.Clear();
        }
    }
}
