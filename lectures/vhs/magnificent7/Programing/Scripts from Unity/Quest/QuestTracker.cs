using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class QuestTracker : MonoBehaviour
{
    public static QuestTracker current;

    [SerializeField] private bool initialized;

    [SerializeField] private Quest[] questList;

    private void Awake()
    {
        if (current == null)
        {
            current = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void OnEnable()
    {
        if (!initialized)
        {
            InitQuests(); //Change this to work with save system
            Debug.Log("Initialized quests");
            initialized = true;
        }
    }

    private void Start()
    {
        GameEvents.current.onNPCFound += CompleteObjective;
        GameEvents.current.onAssisted += CompleteObjective;
        GameEvents.current.onItemDelivered += CompleteObjective;
        GameEvents.current.onNPCKilled += CompleteObjective;
        GameEvents.current.onQuestTurnedIn += TurnInQuest;
        GameEvents.current.onQuestAccepted += AcceptQuest;
    }

    private void InitQuests()
    {
        foreach(Quest quest in questList)
        {
            if (quest.Requirement().Length == 0)
                quest.SetState(QuestState.NEW);
            else
                quest.SetState(QuestState.LOCKED);
            quest.InitObjectives();
        }
    }

    public void AcceptQuest(Quest quest)
    {
        if (quest.GetQuestState() == QuestState.NEW)
        {
            quest.SetState(QuestState.ACCEPTED);
            Debug.Log("Player has accepted the quest: " + quest.GetQuestID());
            HelpTextManager.current.QuestChanged(QuestState.ACCEPTED,quest);
        }
    }

    private void TryCompleteQuest(Quest quest)
    {
        if (quest.GetQuestState() == QuestState.ACCEPTED && quest.AreAllObjectivesCompleted())
        {
            quest.SetState(QuestState.COMPLETED);
            Debug.Log("Player has completed the quest: " + quest.GetQuestID());
            HelpTextManager.current.QuestChanged(QuestState.COMPLETED, quest);
        }
    }

    public void CompleteObjective(Objective objective)
    {
        if(objective.GetObjectiveState() == ObjectiveState.NOTDONE && objective.ObjectiveOf().GetQuestState() == QuestState.ACCEPTED)
        {
            objective.SetState(ObjectiveState.DONE);
            Debug.Log("Player has done the objective: " + objective);
            TryCompleteQuest(objective.ObjectiveOf());
        }
    }

    public void TurnInQuest(Quest quest)
    {
        if (quest.GetQuestState() == QuestState.COMPLETED)
        {
            quest.SetState(QuestState.DONE);
            Debug.Log("Player has turned in the quest: " + quest.GetQuestID());
            HelpTextManager.current.QuestChanged(QuestState.DONE, quest);
            foreach (AmmoPack ammo in quest.GetReward().GetAmmos())
            {
                HelpTextManager.current.AddLoot(ammo.GetAmmoType().ToString(), ammo.GetQuantity());
            }

            foreach (ItemPack item in quest.GetReward().GetItems())
            {
                HelpTextManager.current.AddLoot(item.GetItemType().ToString(), item.GetQuantity());
            }

            HelpTextManager.current.AddLoot("gold coins", quest.GetReward().GetGold());

            if (quest.RequiredFor().Length != 0)
            {
                foreach (var requiredForQuest in quest.RequiredFor())
                {
                    requiredForQuest.SetState(QuestState.NEW);
                    Debug.Log("Player has unlocked a quest: " + requiredForQuest);
                    HelpTextManager.current.QuestChanged(QuestState.NEW, requiredForQuest);
                }
            }

        }
    }
}
