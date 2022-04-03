using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TipList : MonoBehaviour
{
    [SerializeField] private Quest movementTipQuestAccepted;

    private void Start()
    {
        GameEvents.current.onQuestAccepted += ShowQuestsTip;
    }


    private void ShowQuestsTip(Quest quest)
    {
        if (quest == movementTipQuestAccepted)
        {
            TipManager.current.ShowTip("Quest log", "You can see your current quests with [TAB].");
        }
    }

}
