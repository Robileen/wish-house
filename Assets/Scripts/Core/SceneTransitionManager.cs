using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace WishHouse.Core
{
    /// <summary>
    /// Handles visual transitions between scenes/episodes.
    /// Supports fade-in, fade-out, and crossfade effects.
    /// </summary>
    public class SceneTransitionManager : MonoBehaviour
    {
        public static SceneTransitionManager Instance { get; private set; }

        [SerializeField] private Image fadeOverlay;
        [SerializeField] private float defaultFadeDuration = 0.5f;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        /// <summary>
        /// Fade to black, execute callback, then fade back in.
        /// </summary>
        public void FadeTransition(System.Action onMidpoint, float duration = -1)
        {
            if (duration < 0) duration = defaultFadeDuration;
            StartCoroutine(FadeRoutine(onMidpoint, duration));
        }

        private IEnumerator FadeRoutine(System.Action onMidpoint, float duration)
        {
            // Fade out
            yield return StartCoroutine(Fade(0f, 1f, duration));

            onMidpoint?.Invoke();

            // Fade in
            yield return StartCoroutine(Fade(1f, 0f, duration));
        }

        private IEnumerator Fade(float from, float to, float duration)
        {
            if (fadeOverlay == null) yield break;

            float elapsed = 0f;
            Color color = fadeOverlay.color;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / duration);
                color.a = Mathf.Lerp(from, to, t);
                fadeOverlay.color = color;
                yield return null;
            }

            color.a = to;
            fadeOverlay.color = color;
        }

        /// <summary>
        /// Instant black screen.
        /// </summary>
        public void SetBlack()
        {
            if (fadeOverlay == null) return;
            Color c = fadeOverlay.color;
            c.a = 1f;
            fadeOverlay.color = c;
        }

        /// <summary>
        /// Instant clear screen.
        /// </summary>
        public void SetClear()
        {
            if (fadeOverlay == null) return;
            Color c = fadeOverlay.color;
            c.a = 0f;
            fadeOverlay.color = c;
        }
    }
}
