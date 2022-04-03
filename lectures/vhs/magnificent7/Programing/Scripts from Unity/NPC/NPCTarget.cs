using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum NPCTargetType { BUILDING, HOME, PLACE }

public class NPCTarget : MonoBehaviour
{
    [SerializeField] private NPCTargetType targetType;
    [SerializeField] private Transform targetTransform;
    
    public NPCTargetType GetNPCTargetType()
    {
        return targetType;
    }

    public Transform GetTargetTransform()
    {
        return targetTransform;
    }
}
