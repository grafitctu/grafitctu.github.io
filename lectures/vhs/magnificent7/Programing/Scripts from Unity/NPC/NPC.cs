using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;
using TMPro;

public enum ChoreType { GOTO, IDLE }
public enum NPCState { SLEEP, WALK, IDLE, FLEE, INDOOR, IDLEFORCED }

[System.Serializable]
public struct DailyChore
{
    public ChoreType choreType;
    public string choreTitle;
    public NPCTarget targetTransform;
}

[System.Serializable]
public struct ProbabilityChore
{
    public DailyChore dailyChore;
    public int probability;
}

[System.Serializable]
public struct MultipleChore
{
    public ProbabilityChore[] probabilityChore;
}

[System.Serializable]
public struct DailyRoutine
{
    public MultipleChore[] multipleChores;
}

public class NPC : MonoBehaviour, IInteractible
{
    [SerializeField] private string NPCName = "";
    [SerializeField] private float moveSpeed = 0f;
    [SerializeField] private float fleeSpeed = 0f;
    [SerializeField] private NPCState currentState = NPCState.IDLE;
    [SerializeField] private Transform currentBuilding = null;
    [SerializeField] private NPCTarget houseTarget = null;
    [SerializeField] private NPCTarget currentTarget = null;
    [SerializeField] private NavMeshPath currentPath = null;
    [SerializeField] private TextMeshProUGUI helpText = null;
    [SerializeField] private Camera NPCCamera = null;
    [SerializeField] private Transform graphics = null;
    [SerializeField] private Animator npcAnimator = null;
    [SerializeField] private DailyRoutine npcRoutine;
    [SerializeField] private DailyChore newChore;

    public void Interact()
    {
        ChangeState(NPCState.IDLEFORCED);
        GetComponent<Dialog>().ShowDialogOptions();
        DialogOptionManager.current.ShowDialogWindow(true, this);
    }

    public string GetName()
    {
        return NPCName;
    }

    public Camera GetNPCCamera()
    {
        return NPCCamera;
    }

    private void Awake()
    {
        currentPath = new NavMeshPath();
    }

    private void Start()
    {
        TimeManager.current.onHourPassed.AddListener(HourPassedListener);
        InitiateStates();
    }

    private void Update()
    {
        UpdateStates();
    }

    private void HourPassedListener()
    {
        newChore = GetNewChore();
        switch (newChore.choreType)
        {
            case ChoreType.IDLE:
                break;
            case ChoreType.GOTO:
                switch (currentState)
                {
                    case NPCState.FLEE:
                        break;
                    case NPCState.IDLE:
                        ChangeTarget(newChore.targetTransform);
                        break;
                    case NPCState.IDLEFORCED:
                        ChangeTarget(newChore.targetTransform);
                        break;
                    case NPCState.INDOOR:
                        ChangeTarget(newChore.targetTransform);
                        ChangeState(NPCState.IDLE);
                        GetComponent<NavMeshAgent>().destination = currentTarget.GetTargetTransform().position;
                        break;
                    case NPCState.SLEEP:
                        ChangeTarget(newChore.targetTransform);
                        ChangeState(NPCState.IDLE);
                        GetComponent<NavMeshAgent>().destination = currentTarget.GetTargetTransform().position;
                        break;
                    case NPCState.WALK:
                        ChangeTarget(newChore.targetTransform);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    private DailyChore GetNewChore()
    {
        List<int> choreProbabilityPool = new List<int>();

        MultipleChore currentMultipleChores = npcRoutine.multipleChores[Mathf.FloorToInt(TimeManager.current.GetCurrentTime())];

        for (int i = 0; i < currentMultipleChores.probabilityChore.Length; i++)
        {
            for(int j = 0; j<= currentMultipleChores.probabilityChore[i].probability; j++)
            {
                choreProbabilityPool.Add(i);
            }
        }

        for (int k = choreProbabilityPool.Count; k <= 100; k++)
        {
            choreProbabilityPool.Add(-1);
        }

        int newChoreRandomInt = Random.Range(0, 100);
        while (choreProbabilityPool[newChoreRandomInt] < 0)
        {
            newChoreRandomInt = Random.Range(0, 100);
        }
        Debug.Log("Random int: " + choreProbabilityPool[newChoreRandomInt]);

        return currentMultipleChores.probabilityChore[choreProbabilityPool[newChoreRandomInt]].dailyChore;
    }

    private void InitiateStates()
    {
        switch (currentState)
        {
            case NPCState.SLEEP:
            case NPCState.INDOOR:
                DisableNPC();
                break;
            default:
                break;
        }
    }

    private void UpdateStates()
    { 
        switch (currentState)
        {
            case NPCState.SLEEP:
                break;
            case NPCState.IDLE:
                if(DangerManager.current.GetDangerLevel() >= 2)
                {
                    ChangeState(NPCState.FLEE);
                    break;
                }
                if(!IsNPCAtDestination())
                {
                    Debug.Log("I AM NOT AT THE DESTINATION");
                    ChangeState(NPCState.WALK);
                }
                else
                {
                    ResolveTarget();   
                }
                break;
            case NPCState.IDLEFORCED:
                break;
            case NPCState.WALK:
                //Play walk sound
                if (DangerManager.current.GetDangerLevel() >= 2)
                {
                    ChangeState(NPCState.FLEE);
                    break;
                }
                if(IsNPCAtDestination())    
                {
                    ChangeState(NPCState.IDLE);
                }
                break;
            case NPCState.INDOOR:
                break;
            case NPCState.FLEE:
                if (IsNPCAtDestination())
                {
                    ChangeState(NPCState.IDLE);
                }
                break;
            default:
                break;
        }
    }

    private bool IsNPCAtDestination()
    {
        /*NavMeshAgent mNavMeshAgent = GetComponent<NavMeshAgent>();

        if (!mNavMeshAgent.pathPending)
        {
            if (mNavMeshAgent.remainingDistance <= mNavMeshAgent.stoppingDistance)
            {
                if (!mNavMeshAgent.hasPath || mNavMeshAgent.velocity.sqrMagnitude == 0f)
                {
                    return true;
                }
            }
        }
        return false;*/

        return Vector3.Distance(transform.position, currentTarget.transform.position) < 0.1f;
    }

    public void ChangeState(NPCState newState)
    {
        Debug.Log("ChangingState " + currentState + " ---> " + newState);
        switch (newState)
        {
            case NPCState.IDLE:
                switch (currentState)
                {
                    case NPCState.FLEE:
                        GetComponent<NavMeshAgent>().isStopped = true;
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.IDLE:
                        break;
                    case NPCState.WALK:
                        GetComponent<NavMeshAgent>().isStopped = true;
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.IDLEFORCED:
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.SLEEP:
                        EnableNPC();
                        SpawnOutsideHouse();
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.INDOOR:
                        EnableNPC();
                        SpawnOutsideBuilding();
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    default:
                        break;
                }
                break;
            case NPCState.IDLEFORCED:
                switch (currentState)
                {
                    case NPCState.IDLE:
                        currentState = NPCState.IDLEFORCED;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.WALK:
                        GetComponent<NavMeshAgent>().isStopped = true;
                        currentState = NPCState.IDLEFORCED;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.IDLEFORCED:
                        break;
                    default:
                        break;
                }
                break;
            case NPCState.SLEEP:
                switch (currentState)
                {
                    case NPCState.IDLE:
                        currentBuilding = currentTarget.GetTargetTransform();
                        DisableNPC();
                        currentState = NPCState.SLEEP;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.SLEEP:
                        break;
                }
                break;
            case NPCState.WALK:
                switch (currentState)
                {
                    case NPCState.IDLE:
                        GetComponent<NavMeshAgent>().enabled = true;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        GetComponent<NavMeshAgent>().speed = moveSpeed;
                        currentState = NPCState.WALK;
                        npcAnimator.SetTrigger("WALK");
                        break;
                    case NPCState.WALK:
                        break;
                    default:
                        break;
                }
                break;
            case NPCState.INDOOR:
                switch (currentState)
                {
                    case NPCState.IDLE:
                        currentBuilding = currentTarget.GetTargetTransform();
                        currentState = NPCState.INDOOR;
                        npcAnimator.SetTrigger("IDLE");
                        DisableNPC();
                        break;
                    case NPCState.INDOOR:
                        break;
                    default:
                        break;
                }
                
                break;
            case NPCState.FLEE:
                switch (currentState)
                {
                    case NPCState.FLEE:
                        break;
                    case NPCState.IDLE:
                        currentTarget = houseTarget;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        GetComponent<NavMeshAgent>().speed = fleeSpeed;
                        GetComponent<NavMeshAgent>().destination = currentTarget.GetTargetTransform().position;
                        currentState = NPCState.FLEE;
                        npcAnimator.SetTrigger("FLEE");
                        break;
                    case NPCState.WALK:
                        currentTarget = houseTarget;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        GetComponent<NavMeshAgent>().speed = fleeSpeed;
                        GetComponent<NavMeshAgent>().destination = currentTarget.GetTargetTransform().position;
                        currentState = NPCState.FLEE;
                        npcAnimator.SetTrigger("FLEE");
                        break;
                    case NPCState.IDLEFORCED:
                        DialogOptionManager.current.ShowDialogWindow(false, null);
                        currentTarget = houseTarget;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        GetComponent<NavMeshAgent>().speed = fleeSpeed;
                        GetComponent<NavMeshAgent>().destination = currentTarget.GetTargetTransform().position;
                        currentState = NPCState.FLEE;
                        npcAnimator.SetTrigger("FLEE");
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    private void SpawnOutsideHouse()
    {
        GetComponent<NavMeshAgent>().Warp(houseTarget.GetTargetTransform().position);
        transform.rotation = houseTarget.GetTargetTransform().rotation;
    }

    private void SpawnOutsideBuilding()
    {
        GetComponent<NavMeshAgent>().Warp(currentBuilding.position);
        transform.rotation = currentBuilding.rotation;
    }

    private void ChangeTarget(NPCTarget nextTarget)
    {
        currentTarget = nextTarget;
    }

    private void ResolveTarget()
    {
        switch (currentTarget.GetNPCTargetType())
        {
            case NPCTargetType.BUILDING:
                ChangeState(NPCState.INDOOR);
                break;
            case NPCTargetType.HOME:
                ChangeState(NPCState.SLEEP);
                break;
            case NPCTargetType.PLACE:
                ChangeState(NPCState.IDLE);
                break;
            default:
                break;
        }

    }

    private void DisableNPC()
    {
        GetComponent<CapsuleCollider>().enabled = false;
        GetComponent<Rigidbody>().isKinematic = true;
        GetComponent<NavMeshAgent>().enabled = false;
        graphics.gameObject.SetActive(false);
    }

    private void EnableNPC()
    {
        GetComponent<CapsuleCollider>().enabled = true;
        GetComponent<Rigidbody>().isKinematic = false;
        GetComponent<NavMeshAgent>().enabled = true;
        graphics.gameObject.SetActive(true);
     }

}
