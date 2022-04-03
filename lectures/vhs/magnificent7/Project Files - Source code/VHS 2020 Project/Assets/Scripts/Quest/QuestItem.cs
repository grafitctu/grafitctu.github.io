using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class QuestItem : MonoBehaviour, IInteractible
{
    [SerializeField] private Objective objective = null;
    [SerializeField] private string itemName = "";

    public void Interact()
    {
        //Debug.Log("Player has interacted with quest item: " + itemName);
        QuestTracker.current.CompleteObjective(objective);
        if (objective.GetObjectiveState() == ObjectiveState.DONE)
        {
            Destroy(this.gameObject);
        }
    }

    public void SetInteractible(bool val)
    {

    }

    public string GetName()
    {
        return itemName;
    }
}
