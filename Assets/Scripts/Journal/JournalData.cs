using System;
using System.Collections.Generic;
using UnityEngine;

namespace WishHouse.Journal
{
    /// <summary>
    /// Data models for the Journal Book system.
    /// The journal is a scrapbook-style hub where chapters are shown as pages
    /// and episodes appear as washi tape strips that players tap to enter VN/game.
    /// </summary>

    [Serializable]
    public class JournalChapter
    {
        public int chapter;
        public string location;
        public List<JournalEpisode> episodes;
        public ChapterSummary summary;
    }

    [Serializable]
    public class JournalEpisode
    {
        public int episode;
        public string title;
        public int? shiftId;
        public string type;          // "Visual Novel" or "Visual Novel & Game"
        public List<string> pov;
        public string scene;
        public string unlock;

        /// <summary>Whether this episode includes cafe gameplay (has a shift).</summary>
        public bool IsShiftEpisode => shiftId.HasValue;

        /// <summary>Whether this episode is purely visual novel.</summary>
        public bool IsVNOnly => !shiftId.HasValue;
    }

    [Serializable]
    public class ChapterSummary
    {
        public int totalMemories;
        public int unlockedMemories;
        public float customerSatisfaction;
        public bool completed;
    }

    /// <summary>
    /// Tracks the player's unlock/completion state for the journal.
    /// </summary>
    [Serializable]
    public class JournalProgress
    {
        public int currentChapter;
        public int currentEpisode;
        public List<EpisodeProgress> episodeStates;

        public JournalProgress()
        {
            currentChapter = 1;
            currentEpisode = 1;
            episodeStates = new List<EpisodeProgress>();
        }
    }

    [Serializable]
    public class EpisodeProgress
    {
        public int chapter;
        public int episode;
        public EpisodeState state;
        public int memoriesCollected;
        public int totalMemories;
        public List<string> choicesMade;

        public EpisodeProgress()
        {
            state = EpisodeState.Locked;
            memoriesCollected = 0;
            totalMemories = 0;
            choicesMade = new List<string>();
        }
    }

    public enum EpisodeState
    {
        Locked,       // Not yet available - shows incomplete outline
        Unlocked,     // Available to play - shows full washi tape
        InProgress,   // Started but not completed
        Completed     // Finished - shows in Memory Album, replayable
    }

    /// <summary>
    /// Visual configuration for a washi tape strip in the journal.
    /// </summary>
    [Serializable]
    public class WashiTapeConfig
    {
        public Color tapeColor;
        public string npcSketchId;       // Faded NPC watercolor sketch on tape
        public bool hasMagicianPresence;  // Sparkle/glow overlay
        public string decorationType;     // "sticker", "paperclip", "flower", "none"
    }
}
