using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LockableInteractible : MonoBehaviour
{
    [SerializeField] private int timeSince;
    [SerializeField] private int timeTo;

    [SerializeField] private int probability = 100;

    private bool isLocked = false;


    private void Start()
    {
        TimeManager.current.onHourPassed.AddListener(Lock);
        TimeManager.current.onHourPassed.AddListener(Unlock);
    }

    private void Lock()
    {
        if (TimeManager.current.GetCurrentTime() == timeSince)
        {
            int randProb = Random.Range(0, 100);
            if(randProb <= probability)
            {
            Debug.Log("DOORS LOCKED");
                GetComponent<IInteractible>().SetInteractible(false);
                isLocked = true;
            }
        }
    }

    private void Unlock()
    {
        if (TimeManager.current.GetCurrentTime() == timeTo && isLocked)
        {
            Debug.Log("DOORS UNLOCKED");
            isLocked = false;
            GetComponent<IInteractible>().SetInteractible(true);
        }
    }
}
