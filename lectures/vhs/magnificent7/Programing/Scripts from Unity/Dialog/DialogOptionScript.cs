using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;

public enum OptionType { ACCEPT, COMPLETE, TURNIN, NONQUEST, EXIT }
public class DialogOptionScript : MonoBehaviour
{
    public OptionType optionType;
    public Objective objective;
    public string response;

    public void Action()
    {
        switch (optionType)
        {
            case OptionType.ACCEPT:
                QuestTracker.current.AcceptQuest(objective.ObjectiveOf());
                DialogOptionManager.current.QuestChanged();
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.COMPLETE:
                QuestTracker.current.CompleteObjective(objective);
                DialogOptionManager.current.QuestChanged();
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.TURNIN:
                QuestTracker.current.TurnInQuest(objective.ObjectiveOf());
                DialogOptionManager.current.QuestChanged();
                if (response != "")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.NONQUEST:
                if(response!="")
                    DialogResponseManager.current.Response(response);
                break;
            case OptionType.EXIT:
                DialogOptionManager.current.ShowDialogWindow(false, null);
                break;
        }
    }
}
