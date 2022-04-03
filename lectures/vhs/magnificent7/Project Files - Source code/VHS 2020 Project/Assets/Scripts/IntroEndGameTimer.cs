using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

public class IntroEndGameTimer : MonoBehaviour
{
    public static IntroEndGameTimer current;
    private Coroutine endGameTimer = null;
    [SerializeField] private float endGameSeconds = 30f;
    [SerializeField] private Quest conditionQuest = null;
    [SerializeField] private PlayableDirector introEndGameTimerTimeline = null;


    private void Awake()
    {
        if (current == null)
        {
            current = this;
        }
        else
        {
            Destroy(this);
        }
    }

    private void Start()
    {
        GameEvents.current.onQuestAccepted += QuestComparisonForEnd;        
    }

    private void QuestComparisonForEnd(Quest quest)
    {
        if(quest == conditionQuest)
        {
            StopEndGameTimer();
        }
    }

    public void StartEndGameTimer()
    {
        endGameTimer = StartCoroutine(StartTimer());
    }

    private IEnumerator StartTimer()
    {
        yield return new WaitForSeconds(endGameSeconds);
        EndGame();
    }

    public void StopEndGameTimer()
    {
        Debug.Log("Player has started the game");
        StopCoroutine(endGameTimer);
    }

    private void EndGame()
    {
        Time.timeScale = 1f;
        Debug.Log("Game has ended because player hasnt agreed to cooperate");
        introEndGameTimerTimeline.Play();
    }

}
