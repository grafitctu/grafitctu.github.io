using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DangerManager : MonoBehaviour
{
    public static DangerManager current;

    [SerializeField] private int dangerLevel;

    private void Awake()
    {
        if(current == null)
        {
            current = this;
        }
    }

    public int GetDangerLevel()
    {
        return dangerLevel;
    }

    public void SetDangerLevel(int newDangerLevel)
    {
        dangerLevel = newDangerLevel;
    }

}
