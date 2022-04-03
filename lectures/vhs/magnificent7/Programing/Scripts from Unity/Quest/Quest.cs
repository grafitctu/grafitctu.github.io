using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum QuestState{LOCKED, NEW, ACCEPTED, COMPLETED, DONE}

[CreateAssetMenu(fileName = "Quest", menuName = "CustomObjects/Quest")]
[System.Serializable]
public class Quest : ScriptableObject
{
    [SerializeField] private int id;
    [SerializeField] private string title;
    [SerializeField] private string description;

    [SerializeField] private int karmaScore;

    [SerializeField] private Quest[] requireQuests;

    [SerializeField] private Quest[] requiredFor;

    [SerializeField] private Objective[] objectives;

    [SerializeField] private LootTable reward;

    [SerializeField] private QuestState state;

    public void SetState(QuestState state)
    {
        this.state = state;
    }

    public QuestState GetQuestState()
    {
        return state;
    }

    public int GetQuestID()
    {
        return id;
    }

    public string GetQuestTitle()
    {
        return title;
    }

    public LootTable GetReward()
    {
        return reward;
    }

    public bool AreAllObjectivesCompleted()
    {
        bool completed = true;

        foreach (var objective in objectives)
        {
            if(objective.GetObjectiveState() == ObjectiveState.NOTDONE)
            {
                completed = false;
                break;
            }
        }

        return completed;
    }

    public void InitObjectives()
    {
        foreach (var objective in objectives)
        {
            objective.SetState(ObjectiveState.NOTDONE);
        }
    }

    public Quest[] RequiredFor()
    {
        return requiredFor;
    }

    public Quest[] Requirement()
    {
        return requireQuests;
    }

}
