using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

public class SearchAndDestroy : MonoBehaviour
{
    [SerializeField] private Objective objectiveActivation = null;
    [SerializeField] private GameObject graphics = null;
    [SerializeField] private bool riseDangerLevel = true;
    private void Start()
    {
        GameEvents.current.onQuestAccepted += CompareQuest;
    }

    private void CompareQuest(Quest compareWith)
    {
        Debug.Log("Is this my quest? " + compareWith);
        if(objectiveActivation.ObjectiveOf() == compareWith)
        {
            Debug.Log("YES!");
            Spawn();
        }
    }

    private void Spawn()
    {
        GetComponent<CapsuleCollider>().enabled = true;
        GetComponent<NavMeshAgent>().enabled = true;
        GetComponent<NPC>().enabled = true;
        graphics.SetActive(true);
        if(riseDangerLevel)
            DangerManager.current.SetDangerLevel(3);
        //StartCoroutine(DieAfterTime());
    }

    private IEnumerator DieAfterTime()
    {
        yield return new WaitForSeconds(15f);
        Die();
    }

    public void Die()
    {
        Debug.Log("NPC SAD DIED");
        GetComponent<NavMeshAgent>().enabled = false;
        GetComponent<NPC>().enabled = false;
        if(riseDangerLevel)
            DangerManager.current.SetDangerLevel(0);
        QuestTracker.current.CompleteObjective(objectiveActivation);
        GetComponent<Lootable>().SetLootableActive();
        gameObject.layer = 11;//Interactible
    }
}
