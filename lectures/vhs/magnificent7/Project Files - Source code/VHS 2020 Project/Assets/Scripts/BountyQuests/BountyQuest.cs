using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BountyQuest : MonoBehaviour, IInteractible
{
    [SerializeField] private string bountyName = "";
    [SerializeField] private Quest bountyQuest = null;
    [SerializeField] private GameObject banditObject = null;

    private bool isActive = true;

    public string GetName()
    {
        return bountyName;
    }

    public void Interact()
    {
        if (!GameManager.current.playerObject.GetComponent<PlayerWeapons>().ownership[1] && !GameManager.current.playerObject.GetComponent<PlayerWeapons>().ownership[2])
            HelpTextManager.current.ShowErrorMessage("I have to get a weapon first");
        if (bountyQuest.GetQuestState() != QuestState.NEW)
            return;

        if (isActive)
        {
            GameEvents.current.QuestAccepted(bountyQuest);
            GameManager.current.TookBounty();
            HideBounty();
            //SpawnBandit();
        }
    }

    public void SetInteractible(bool val)
    {

    }

    private void HideBounty()
    {
        GetComponent<MeshRenderer>().enabled = false;
        GetComponent<BoxCollider>().enabled = false;
        isActive = false;
    }

    private void SpawnBandit()
    {
        banditObject.SetActive(true);
    }

}
