using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum ObjectiveType { FINDNPC, ESCORT, SAD, DELIVERY, ASSISTANCE }
public enum ObjectiveState { NOTDONE, DONE }

[CreateAssetMenu(fileName = "Objective", menuName = "CustomObjects/Objective")]
public class Objective : ScriptableObject
{
    [SerializeField] private string title;
    [SerializeField] private ObjectiveType type;
    [SerializeField] private ObjectiveState state;
    [SerializeField] private Quest objectiveOf;

    public ObjectiveState GetObjectiveState()
    {
        return state;
    }

    public void SetState(ObjectiveState state)
    {
        this.state = state;
    }

    public Quest ObjectiveOf()
    {
        return objectiveOf;
    }

}
