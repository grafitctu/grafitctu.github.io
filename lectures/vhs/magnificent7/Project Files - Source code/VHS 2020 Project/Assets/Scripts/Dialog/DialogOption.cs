using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

[System.Serializable]
public class OptionRequirement
{
    [SerializeField] private Quest reqQuest = null;
    [SerializeField] private QuestState questState = QuestState.LOCKED;

    public bool Done()
    {
        return reqQuest.GetQuestState() == questState;
    }
}

[System.Serializable]
public class GoldRequirement
{
    [SerializeField] private int goldAmount;
    public bool Done()
    {
        return GameManager.current.playerObject.GetComponent<Player_Base>().GetGold()>=goldAmount;
    }
}

[System.Serializable]
public class DayRequirement
{
    [SerializeField] private int dayRequired;
    public bool Done()
    {
        return TimeManager.current.GetCurrentDay() >= dayRequired;
    }
}

[System.Serializable]
[CreateAssetMenu(fileName ="DialogOption",menuName ="CustomObjects/DialogOption")]
public class DialogOption : ScriptableObject
{
    [SerializeField] private bool hasRequirement = false;
    [SerializeField] private bool hasGoldRequirement = false;
    [SerializeField] private bool hasDayRequirement = false;
    [SerializeField] private OptionRequirement requirement = null;
    [SerializeField] private GoldRequirement goldRequirement = null;
    [SerializeField] private DayRequirement dayRequirement = null;
    public string text;
    public OptionType optionType;
    public Objective objective;
    public LootType lootType;
    public string response;
    public int gold;
    public ItemPack lootItem;
    public AmmoPack lootAmmo;
    public bool oneTime;
    public bool alreadyUsed;
    public string unlockable;

    public bool HasRequirement()
    {
        return hasRequirement;
    }

    public bool RequirementState()
    {
        if (hasRequirement && hasGoldRequirement && hasDayRequirement)
            return requirement.Done() && goldRequirement.Done() && dayRequirement.Done();
        else if (hasRequirement && hasGoldRequirement)
            return requirement.Done() && goldRequirement.Done();
        else if (hasRequirement && hasDayRequirement)
            return requirement.Done() && dayRequirement.Done();
        else if (hasGoldRequirement && hasDayRequirement)
            return goldRequirement.Done() && dayRequirement.Done();
        else if (hasDayRequirement)
            return dayRequirement.Done();
        else if (hasGoldRequirement)
            return goldRequirement.Done();
        else if (hasRequirement)
            return requirement.Done();
        else
            return true;
    }

}
