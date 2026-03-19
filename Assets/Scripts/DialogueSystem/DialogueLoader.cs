using System.Collections.Generic;
using UnityEngine;
using WishHouse.Data;

namespace WishHouse.Dialogue
{
    /// <summary>
    /// Loads episode dialogue JSON files from Resources/DialogueFiles/.
    /// Place JSON files at: Assets/Resources/DialogueFiles/Chapter{N}/Episode{N}/
    /// </summary>
    public class DialogueLoader : MonoBehaviour
    {
        private Dictionary<string, EpisodeData> _cache = new Dictionary<string, EpisodeData>();

        /// <summary>
        /// Load an episode dialogue file by chapter and episode number.
        /// </summary>
        public EpisodeData LoadEpisode(int chapter, int episode)
        {
            string key = $"ch{chapter}_ep{episode}";

            if (_cache.ContainsKey(key))
                return _cache[key];

            string path = $"DialogueFiles/Chapter{chapter}/Episode{episode}/episode{episode}_dialogue";
            TextAsset jsonFile = Resources.Load<TextAsset>(path);

            if (jsonFile == null)
            {
                Debug.LogError($"[DialogueLoader] Could not load: {path}");
                return null;
            }

            EpisodeData data = JsonUtility.FromJson<EpisodeData>(jsonFile.text);
            _cache[key] = data;

            Debug.Log($"[DialogueLoader] Loaded Chapter {chapter}, Episode {episode} ({data.episodes?.Count ?? 0} blocks)");
            return data;
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
