using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NPCTargetRouter : MonoBehaviour
{
    [SerializeField] private NPCTargetRouter routesTo = null;

    public NPCTargetRouter GetRoutesTo()
    {
        return routesTo;
    }

    public Transform GetTransform()
    {
        return transform;
    }
}
