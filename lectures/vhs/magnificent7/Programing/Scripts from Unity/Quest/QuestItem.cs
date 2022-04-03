using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class QuestItem : MonoBehaviour, IInteractible
{
    [SerializeField] private Objective objective;
    [SerializeField] private string name;

    public void Interact()
    {
        Debug.Log("Player has interacted with quest item: " + this.gameObject.name);
        QuestTracker.current.CompleteObjective(objective);
        if (objective.GetObjectiveState() == ObjectiveState.DONE)
        {
            Destroy(this.gameObject);
        }
    }

    public string GetName()
    {
        return name;
    }
}
