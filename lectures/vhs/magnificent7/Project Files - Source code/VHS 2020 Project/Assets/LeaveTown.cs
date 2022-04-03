using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

public class LeaveTown : MonoBehaviour, IInteractible
{
    [SerializeField] private PlayableDirector timelineLeaveTown;

    public string GetName()
    {
        return "Leave the town (Exit game)";
    }

    public void Interact()
    {
        timelineLeaveTown.Play();
    }

    public void SetInteractible(bool val)
    {
        
    }
}
