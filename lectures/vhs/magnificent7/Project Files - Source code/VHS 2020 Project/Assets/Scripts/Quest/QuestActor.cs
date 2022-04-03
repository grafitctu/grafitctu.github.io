using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class QuestActor : MonoBehaviour
{
    [SerializeField] private Objective objective = null;

    public void QuestAccepted()
    {
        GameEvents.current.QuestAccepted(objective.ObjectiveOf());
    }

    public void QuestTurnedIn()
    {
        GameEvents.current.QuestTurnedIn(objective.ObjectiveOf());
    }

    public void NPCFound()
    {
        GameEvents.current.NPCFound(objective);
    }

    public void NPCKilled()
    {
        GameEvents.current.NPCKilled(objective);
    }

    public void ItemDelivered()
    {
        GameEvents.current.ItemDelivered(objective);
    }

    public void Assisted()
    {
        GameEvents.current.Assisted(objective);
    }
}
