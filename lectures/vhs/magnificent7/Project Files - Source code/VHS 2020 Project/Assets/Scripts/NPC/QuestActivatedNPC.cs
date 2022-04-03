using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

public class QuestActivatedNPC : MonoBehaviour
{
    [SerializeField] private Objective objectiveActivation;
    [SerializeField] private GameObject graphics;

    private void Start()
    {
        GameEvents.current.onQuestAccepted += CompareQuest;
    }

    private void CompareQuest(Quest compareWith)
    {
        if (objectiveActivation.ObjectiveOf() == compareWith)
        {
            Spawn();
        }
    }

    private void Spawn()
    {
        GetComponent<CapsuleCollider>().enabled = true;
        GetComponent<NavMeshAgent>().enabled = true;
        GetComponent<NPC>().enabled = true;
        graphics.SetActive(true);
    }

    private IEnumerator DieAfterTime()
    {
        yield return new WaitForSeconds(15f);
        Die();
    }

    public void Die()
    {
        GetComponent<NavMeshAgent>().enabled = false;
        GetComponent<NPC>().enabled = false;
    }
}
