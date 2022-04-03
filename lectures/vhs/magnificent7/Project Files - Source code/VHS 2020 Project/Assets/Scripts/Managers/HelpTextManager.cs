using UnityEngine;
using TMPro;

public class HelpTextManager : MonoBehaviour
{
    public static HelpTextManager current;

    [SerializeField] private RollingText rollingText = null;
    [SerializeField] private GameObject helpText = null;

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

    public void AddLoot(string lootName, int lootQuantity)
    {
        rollingText.AddLoot(lootName, lootQuantity);
    }

    public void RemoveLoot(string lootName, int lootQuantity)
    {
        rollingText.RemoveLoot(lootName, lootQuantity);
    }

    public void ShowErrorMessage(string errorMessage)
    {
        rollingText.ShowErrorMessage(errorMessage);
    }

    public void QuestChanged(QuestState questState, Quest quest)
    {
        rollingText.QuestChanged(questState,quest);
    }

    public void ShowHelpText(string help)
    {
        if(!helpText.activeInHierarchy||helpText.GetComponent<TextMeshProUGUI>().text != help)
        {
            helpText.GetComponent<TextMeshProUGUI>().text = help;
            helpText.SetActive(true);
        } 
    }

    public void HideHelpText()
    {
        if(helpText.activeInHierarchy)
            helpText.SetActive(false);
    }
}
