using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

public class Unlockable : MonoBehaviour
{
    private bool isLocked = true;

    public void Unlock()
    {
        isLocked = false;
        GetComponent<IInteractible>().SetInteractible(true);
    }

    public void Lock()
    {
        isLocked = true;
        GetComponent<IInteractible>().SetInteractible(false);
    }

    public bool IsLocked()
    {
        return isLocked;
    }
}
