using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DontDestroyManagers : MonoBehaviour
{
    public static DontDestroyManagers current;

    private void Awake()
    {
        if (current == null)
        {
            current = this;
            DontDestroyOnLoad(this.gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
}
