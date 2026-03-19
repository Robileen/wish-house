using System;
using System.Collections.Generic;
using UnityEngine;

namespace WishHouse.Data
{
    [Serializable]
    public class EpisodeData
    {
        public int chapter;
        public Dictionary<string, EpisodeBlock> episodes;
    }

    [Serializable]
    public class EpisodeBlock
    {
        public float episode;
        public List<DialogueLine> dialogueLines;
        public List<Choice> choices;
        public List<CafeOrder> cafeOrders;
        public SceneTransition sceneTransition;
    }

    [Serializable]
    public class DialogueLine
    {
        public int id;
        public string speaker;
        public string text;
        public string expression;
    }

    [Serializable]
    public class Choice
    {
        public string id;
        public string prompt;
        public List<ChoiceOption> options;
    }

    [Serializable]
    public class ChoiceOption
    {
        public string text;
        public NavigationTarget next;
    }

    [Serializable]
    public class NavigationTarget
    {
        public int chapter;
        public float episode;
    }

    [Serializable]
    public class SceneTransition
    {
        public NavigationTarget next;
        public string effect;
        public string music;
        public int delayMs;
    }

    [Serializable]
    public class CafeOrder
    {
        public string orderId;
        public string customer;
        public List<OrderItem> items;
        public string servedBy;
        public string notes;
    }

    [Serializable]
    public class OrderItem
    {
        public string name;
        public string type;
        public string size;
        public int sugar;
        public string milk;
    }

    [Serializable]
    public class CharacterInfo
    {
        public string id;
        public string displayName;
        public string role;
        public List<string> expressions;

        public string FormattedName
        {
            get
            {
                if (string.IsNullOrEmpty(role))
                    return displayName;
                return $"{displayName} ({role})";
            }
        }
    }
}
