using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.Events;

public class TimeManager : MonoBehaviour
{
    public static TimeManager current;

    [SerializeField] private float currentTime;

    [SerializeField] private TextMeshProUGUI timeText;

    [SerializeField] private float hourLengthInSeconds;

    public UnityEvent onHourPassed = new UnityEvent();

    private void Awake()
    {
        if(current == null)
        {
            current = this;
        }

        if (currentTime < 10)
            timeText.text = "0" + currentTime + ":00";
        else
            timeText.text = currentTime + ":00";
    }

    public float GetCurrentTime()
    {
        return currentTime;
    }

    private void Start()
    {
        if (currentTime < 0)
            timeText.text = "0" + currentTime + ":00";
        else
            timeText.text = currentTime + ":00";
        InvokeRepeating("AddHour", hourLengthInSeconds, hourLengthInSeconds);
    }

    private void AddHour()
    {
        currentTime += 1f;
        if(currentTime >= 24f)
        {
            currentTime = 0f;
        }

        if(currentTime<10)
            timeText.text = "0" + currentTime + ":00";
        else
            timeText.text = currentTime + ":00";

        //Play bell sound

        onHourPassed.Invoke();
    }
}
