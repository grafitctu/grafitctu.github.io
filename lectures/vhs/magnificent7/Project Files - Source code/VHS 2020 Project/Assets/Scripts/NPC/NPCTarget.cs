using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum NPCTargetType { BUILDING, SIT, HOME, PLACE }

[System.Serializable]
public class NPCTarget : MonoBehaviour
{
    [SerializeField] private NPCTargetType targetType = NPCTargetType.PLACE;
    [SerializeField] private Transform targetTransform = null;
    [SerializeField] private Transform sittingTransform = null;
    [SerializeField] private List<NPC> npcsInThisDestination = new List<NPC>();
    [SerializeField] private SceneName targetSceneName = SceneName.TOWN;
    [SerializeField] private NPCTarget routesTo = null;
    
    public NPCTargetType GetNPCTargetType()
    {
        return targetType;
    }

    public NPCTarget GetRoutesTo()
    {
        return routesTo;
    }

    public Transform GetTargetTransform()
    {
        return targetTransform;
    }

    public SceneName GetTargetSceneName()
    {
        return targetSceneName;
    }

    public Transform GetSittingTransform()
    {
        return sittingTransform;
    }

    public List<NPC> GetNearbyNPCs()
    {
        return npcsInThisDestination;
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.GetComponent<NPC>())
        {
            other.GetComponent<NPC>().CheckForOthersAtDestination();
            npcsInThisDestination.Add(other.GetComponent<NPC>());
        }
    }

    private void OnTriggerExit(Collider other)
    {
        if (other.GetComponent<NPC>())
        {
            foreach (NPC npc in other.GetComponent<NPC>().talkingTo)
            {
                npc.talkingTo.Remove(other.GetComponent<NPC>());
            }
            other.GetComponent<NPC>().talkingTo.Clear();
            npcsInThisDestination.Remove(other.GetComponent<NPC>());
        }
    }
}
