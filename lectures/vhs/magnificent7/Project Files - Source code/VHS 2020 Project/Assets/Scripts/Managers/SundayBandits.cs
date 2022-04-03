using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

public class SundayBandits : MonoBehaviour
{
    [SerializeField] GameObject sundayBandits;
    [SerializeField] PlayableDirector sundayEventTimeline;
    [SerializeField] PlayableDirector endScreenTimeline;

    [SerializeField] NPC[] bandits;

    void Start()
    {
        TimeManager.current.onHourPassed.AddListener(CheckForTheTime);  
    }

    private void CheckForTheTime()
    {
        if (TimeManager.current.GetCurrentDay() == 6 && TimeManager.current.GetCurrentTime() == 14)
            StartSundayBanditEvent();
    }

    private void StartSundayBanditEvent()
    {
        sundayBandits.SetActive(true);
        DangerManager.current.SetDangerLevel(2);
        sundayEventTimeline.Play();
    }

    private void Update()
    {
        CheckForAllDeadBandits();   
    }

    private void CheckForAllDeadBandits()
    {
        int banditsDead = 0;
        foreach (NPC bandit in bandits)
        {
            if (bandit.isDead)
                banditsDead++;
        }
        if (banditsDead == 5)
        {
            StartEndScreen();
        }
    }

    private void StartEndScreen()
    {
        Time.timeScale = 1f;
        DangerManager.current.SetDangerLevel(0);
        endScreenTimeline.Play();
    }
}
