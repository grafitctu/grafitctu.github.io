using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

[System.Serializable]
public class OptionRequirement
{
    [SerializeField] private Quest reqQuest;
    [SerializeField] private QuestState questState;

    public bool Done()
    {
        return reqQuest.GetQuestState() == questState;
    }
}

[System.Serializable]
[CreateAssetMenu(fileName ="DialogOption",menuName ="CustomObjects/DialogOption")]
public class DialogOption : ScriptableObject
{
    [SerializeField] private bool hasRequirement = false;
    [SerializeField] private OptionRequirement requirement = null;

    public string text;
    public OptionType optionType;
    public Objective objective;
    public string response;

    public bool HasRequirement()
    {
        return hasRequirement;
    }

    public bool RequirementState()
    {
        if (hasRequirement)
            return requirement.Done();
        else
            return true;
    }

}
