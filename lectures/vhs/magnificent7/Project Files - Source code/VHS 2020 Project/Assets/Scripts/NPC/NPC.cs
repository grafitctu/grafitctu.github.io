using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;
using TMPro;

public enum ChoreType { GOTO, IDLE }
public enum NPCState { SLEEP, WALK, IDLE, FLEE, IDLEFORCED, SIT, TALK, COMBAT, DEAD }

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
    [Header("Basic informations")]
    [SerializeField] private string NPCName = "";
    [SerializeField] private bool isMale = true;
    [SerializeField] private int maxHealth = 100;
    [SerializeField] private int currentHealth = 100;

    [Header("Daily Routine")]
    [SerializeField] private DailyRoutine npcRoutine = new DailyRoutine();
    [SerializeField] private DailyChore newChore = new DailyChore();

    [Header("Combat")]
    [SerializeField] private int damage = 20;
    [SerializeField] private float shootCooldown = 5f;
    [SerializeField] private float maxShootCooldown = 5f;
    [SerializeField] private Transform shootTransform = null;
    [SerializeField] private AudioClip weaponFireSound = null;
    [SerializeField] private bool isFleeable = true;
    [SerializeField] private bool startsCombatOnDamage = true;

    [Header("NPC movement")]
    [SerializeField] private float moveSpeed = 0f;
    [SerializeField] private float fleeSpeed = 0f;
    [SerializeField] private float combatSpeed = 0f;

    [Header("State management")]
    [SerializeField] private NPCState currentState = NPCState.IDLE;
    [SerializeField] private SceneName currentSceneName = SceneName.TOWN;
    public bool isDead = false;

    [Header("NPC Targets")]
    [SerializeField] private NPCTarget currentTarget = null;
    [SerializeField] private NPCTarget houseTarget = null;
    [SerializeField] private Transform combatTarget = null;
    [SerializeField] private Queue<NPCTarget> currentTargetQueue = new Queue<NPCTarget>();
    public List<NPC> talkingTo = new List<NPC>();

    [Header("References")]
    [SerializeField] private Camera NPCCamera = null;
    [SerializeField] private Transform graphics = null;
    [SerializeField] private Animator npcAnimator = null;
    [SerializeField] private NPCTarget sheriffInsideRouter = null;
    [SerializeField] private NPCTarget sheriffOutsideRouter = null;
    [SerializeField] private NPCTarget saloonInsideRouter = null;
    [SerializeField] private NPCTarget saloonOutsideRouter = null;
    [SerializeField] private NPCTarget merchantInsideRouter = null; 
    [SerializeField] private NPCTarget merchantOutsideRouter = null;
    [SerializeField] private NPCTarget churchInsideRouter = null;
    [SerializeField] private NPCTarget churchOutsideRouter = null;

    private bool isFleeingFromPlayer = false;
    private NPCTarget targetBeforeFleeing = null;
    private bool isFleeing = false;
    private bool canHit = false;
    private Vector3 forcedPosition = Vector3.zero;

    public void Interact()
    {
        if (GetComponent<Lootable>() && isDead)
        {
            GetComponent<Lootable>().Interact();
        }
        else
        {
            ChangeState(NPCState.IDLEFORCED);
            GetComponent<Dialog>().ShowDialogOptions();
            DialogOptionManager.current.ShowDialogWindow(true, this);
        }
    }

    public void SetInteractible(bool val)
    {

    }

    public SoundManager.TalkType GetGender()
    {
        if (isMale)
        {
            return SoundManager.TalkType.Male;
        }
        else
        {
            return SoundManager.TalkType.Female;
        }
    }

    public string GetName()
    {
        return NPCName;
    }

    public Camera GetNPCCamera()
    {
        return NPCCamera;
    }

    private void Start()
    {
        TimeManager.current.onHourPassed.AddListener(HourPassedListener);
        InitiateStates();
    }

    private void Update()
    {
        if (!isDead)
        {
            UpdateStates();
            if (GetComponent<NavMeshAgent>().updatePosition == false)
            {
                GetComponent<NavMeshAgent>().nextPosition = forcedPosition;
            }
        }
    }

    public void SetCombatTarget(Transform newCombatTarget)
    {
        combatTarget = newCombatTarget;
    }

    public void Damage(int damage, GameObject damageFrom)
    {
        if (!isDead && startsCombatOnDamage)
        {
            if (damageFrom.GetComponent<Player_Base>())
            {
                SetCombatTarget(damageFrom.transform);
                ChangeState(NPCState.COMBAT);
            }
            currentHealth -= damage;
            if (currentHealth <= 0)
            {
                Debug.Log("NPC has died");
                StartCoroutine(Die());
            }
        }

        if (!startsCombatOnDamage)
        {
            isFleeingFromPlayer = true;
            StartCoroutine(FleeingFromPlayer());
        }
    }

    private IEnumerator FleeingFromPlayer()
    {
        yield return new WaitForSeconds(5f);
        isFleeingFromPlayer = false;
    }

    public IEnumerator Die()
    {
        ChangeState(NPCState.DEAD);
        isDead = true;
        //npcAnimator.SetLayerWeight(npcAnimator.GetLayerIndex("Combat"), 0f);
        yield return new WaitForEndOfFrame();
        npcAnimator.SetTrigger("DIE");
        if (GetComponent<SearchAndDestroy>())
        {
            GetComponent<SearchAndDestroy>().Die();
        }
        else
        {
            GetComponent<NavMeshAgent>().enabled = false;
            GetComponent<NPC>().enabled = false;
            if (GetComponent<Lootable>())
            {
                GetComponent<Lootable>().SetLootableActive();
                gameObject.layer = 11;//Interactible
            }
        }
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
                        ChangeTargetAfterHourPassed(newChore.targetTransform);
                        ChangeState(NPCState.WALK);
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        break;
                    case NPCState.TALK:
                        ChangeTargetAfterHourPassed(newChore.targetTransform);
                        ChangeState(NPCState.WALK);
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        break;
                    case NPCState.IDLEFORCED:
                        ChangeTargetAfterHourPassed(newChore.targetTransform);
                        break;
                    case NPCState.SLEEP:
                        ChangeTargetAfterHourPassed(newChore.targetTransform);
                        if(DangerManager.current.GetDangerLevel() < 2 && !isFleeingFromPlayer)
                        {
                            ChangeState(NPCState.WALK);
                            GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        }
                        break;
                    case NPCState.WALK:
                        ChangeTargetAfterHourPassed(newChore.targetTransform);
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        break;
                    case NPCState.SIT:
                        ChangeTargetAfterHourPassed(newChore.targetTransform);
                        ChangeState(NPCState.WALK);
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
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
        //Debug.Log("Random int: " + choreProbabilityPool[newChoreRandomInt]);

        return currentMultipleChores.probabilityChore[choreProbabilityPool[newChoreRandomInt]].dailyChore;
    }

    private void InitiateStates()
    {
        switch (currentState)
        {
            case NPCState.SLEEP:
                DisableNPC();
                break;
            case NPCState.WALK:
                npcAnimator.SetTrigger("WALK");
                currentTarget = GetNewChore().targetTransform;
                GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                break;
            case NPCState.IDLE:
                npcAnimator.SetTrigger("IDLE");
                break;
            case NPCState.SIT:
                GetComponent<NavMeshAgent>().enabled = false;
                transform.position = currentTarget.GetSittingTransform().position;
                transform.rotation = currentTarget.GetSittingTransform().rotation;
                npcAnimator.SetTrigger("SIT");
                break;
            case NPCState.TALK:
                npcAnimator.SetTrigger("TALK");
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
                if (isFleeing && DangerManager.current.GetDangerLevel() < 2)
                {
                    isFleeing = false;
                    if (GetNewChore().choreType == ChoreType.IDLE)
                        ChangeTargetAfterHourPassed(targetBeforeFleeing);
                    else
                    {
                        HourPassedListener();
                    }
                    ChangeState(NPCState.WALK);
                }
                break;
            case NPCState.IDLE:
                ResolveTarget();

                if ((DangerManager.current.GetDangerLevel() >= 2 || isFleeingFromPlayer)&& isFleeable)
                {
                    ChangeState(NPCState.FLEE);
                    break;
                }
                break;
            case NPCState.IDLEFORCED:
                break;
            case NPCState.WALK:
                graphics.transform.LookAt(GetComponent<NavMeshAgent>().steeringTarget);
                if ((DangerManager.current.GetDangerLevel() >= 2 || isFleeingFromPlayer) && isFleeable)
                {
                    ChangeState(NPCState.FLEE);
                    break;
                }
                if(IsNPCAtDestination())    
                {
                    ChangeState(NPCState.IDLE);
                }
                break;
            case NPCState.FLEE:
                graphics.transform.LookAt(GetComponent<NavMeshAgent>().steeringTarget);
                if (DangerManager.current.GetDangerLevel() < 2 && !isFleeingFromPlayer)
                {
                    ChangeState(NPCState.IDLE);
                    break;
                }
                if (isFleeing && DangerManager.current.GetDangerLevel() < 2 && !isFleeingFromPlayer)
                {
                    isFleeing = false;
                    ChangeState(NPCState.IDLE);
                    break;
                }
                if (IsNPCAtDestination())
                {
                    ChangeState(NPCState.IDLE);
                }
                break;
            case NPCState.SIT:
                if ((DangerManager.current.GetDangerLevel() >= 2 || isFleeingFromPlayer) && isFleeable)
                {
                    ChangeState(NPCState.FLEE);
                    break;
                }
                break;
            case NPCState.TALK:
                if ((DangerManager.current.GetDangerLevel() >= 2 || isFleeingFromPlayer) && isFleeable)
                {
                    ChangeState(NPCState.FLEE);
                    break;
                }
                break;
            case NPCState.COMBAT:
                if (isDead)
                {
                    npcAnimator.SetTrigger("DIE");
                    break;
                }

                shootCooldown -= Time.deltaTime;
                graphics.transform.LookAt(GetComponent<NavMeshAgent>().steeringTarget);
                RaycastHit hit;graphics.transform.LookAt(GetComponent<NavMeshAgent>().steeringTarget);
                if(Physics.Raycast(shootTransform.position,transform.forward,out hit, 9999f))
                {
                    if(hit.collider.tag != "Player")
                    {
                        canHit = false;
                    }
                    else
                    {
                        canHit = true;
                    }
                }

                if(Vector3.Distance(combatTarget.position,transform.position) > 18 || !canHit)
                {
                    npcAnimator.SetTrigger("WALK");
                    GetComponent<NavMeshAgent>().SetDestination(combatTarget.position);
                    GetComponent<NavMeshAgent>().speed = combatSpeed;
                    GetComponent<NavMeshAgent>().isStopped = false;
                }
                else //NPC has reached weapon range
                {
                    npcAnimator.SetTrigger("IDLE");
                    GetComponent<NavMeshAgent>().ResetPath();
                    GetComponent<NavMeshAgent>().speed = 0f;
                    GetComponent<NavMeshAgent>().isStopped = true;
                    transform.LookAt(combatTarget);
                    if(shootCooldown <= 0f)
                    {
                        shootCooldown = maxShootCooldown;
                        Shoot();
                    }
                }
                break;
            default:
                break;
        }
    }

    private void Shoot()
    {
        GetComponent<AudioSource>().PlayOneShot(weaponFireSound);
        if (combatTarget.GetComponent<Player_Base>())
        {
            Debug.Log("NPC has shot the player");
            combatTarget.GetComponent<PlayerHealth>().DamagePlayer(damage);
        }
    }

    public void CheckForOthersAtDestination()
    {
        Debug.Log("Checking For Others");
        List<NPC> nearbyNPCs = currentTarget.GetNearbyNPCs();
        if(nearbyNPCs.Count >= 1)
        {
            foreach(NPC npc in nearbyNPCs)
            {
                if(npc.currentState == NPCState.IDLE)
                {
                    ChangeState(NPCState.TALK);
                    npc.ChangeState(NPCState.TALK);
                    Vector3 pointBetweenTwoNPCs = GetPointBetweenTwoNPCs(transform.position, npc.transform.position);
                    transform.LookAt(pointBetweenTwoNPCs);
                    npc.transform.LookAt(pointBetweenTwoNPCs);
                    NPCTalkingTo(npc);
                    npc.NPCTalkingTo(this);
                    break;
                }

                if(npc.currentState == NPCState.TALK)
                {
                    List<NPC> npcsTalking = npc.talkingTo;
                    foreach (NPC npcTalkingSingle in npcsTalking)
                    {
                        npcTalkingSingle.NPCTalkingTo(this);
                        NPCTalkingTo(npcTalkingSingle);
                    }
                    nearbyNPCs = currentTarget.GetNearbyNPCs();
                    Vector3 pointBetweenNPCs = GetPointBetweenNPCs(nearbyNPCs);
                    foreach (NPC npcTalking in nearbyNPCs)
                    {
                        npcTalking.transform.LookAt(pointBetweenNPCs);
                    }
                    ChangeState(NPCState.TALK);
                    break;
                }
            }
        }
    }

    private Vector3 GetPointBetweenNPCs(List<NPC> npcs)
    {
        float posXsum = 0f;
        float posZsum = 0f;
        foreach (NPC npc in npcs)
        {
            posXsum += npc.transform.position.x;
            posZsum += npc.transform.position.z;
        }

        return new Vector3(posXsum / npcs.Count, npcs[0].transform.position.y, posZsum / npcs.Count);
    }

    private Vector3 GetPointBetweenTwoNPCs(Vector3 pos1, Vector3 pos2)
    {
        float posX = (pos2.x + pos1.x) / 2;
        float posZ = (pos2.z + pos1.z) / 2;

        return new Vector3(posX, pos1.y, posZ);
    }

    public void NPCTalkingTo(NPC npc)
    {
        if(!talkingTo.Contains(npc))
            talkingTo.Add(npc);
    }

    private bool IsNPCAtDestination()
    {
        //Debug.Log(name + " has Called DestinationCheck");
        NavMeshAgent mNavMeshAgent = GetComponent<NavMeshAgent>();

        if (!mNavMeshAgent.pathPending && mNavMeshAgent.isStopped == false)
        {
            if (mNavMeshAgent.remainingDistance <= .3f) //<=mNavMeshAgent.stoppingDistance
            {
                return true;
                /*if (!mNavMeshAgent.hasPath || mNavMeshAgent.velocity.sqrMagnitude == 0f)
                {
                    return true;
                }*/
            }
        }
        return false;
    }

    public void StopNavigating()
    {
        GetComponent<NavMeshAgent>().ResetPath();

        GameManager.current.playerObject.GetComponent<Player_Base>().canMove = false;
        GameManager.current.playerObject.GetComponent<Player_Base>().StopWalkingAnimation();
    }

    public void StartNavigation()
    {
        GameManager.current.playerObject.GetComponent<Player_Base>().canMove = true;
    }

    public void ChangeState(NPCState newState)
    {
        //(name + " is ChangingState " + currentState + " ---> " + newState);
        switch (newState)
        {
            case NPCState.DEAD:
                currentState = NPCState.DEAD;
                npcAnimator.SetTrigger("DIE");
                break;
            case NPCState.IDLE:
                switch (currentState)
                {
                    case NPCState.FLEE:
                        if(DangerManager.current.GetDangerLevel() < 2 && !isFleeingFromPlayer)
                        {
                            if (GetNewChore().choreType == ChoreType.IDLE)
                                ChangeTargetAfterHourPassed(targetBeforeFleeing);
                            else
                            {
                                HourPassedListener();
                            }
                        }
                        GetComponent<NavMeshAgent>().speed = 0f;
                        GetComponent<NavMeshAgent>().velocity = Vector3.zero;
                        GetComponent<NavMeshAgent>().isStopped = true;
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.IDLE:
                        break;
                    case NPCState.WALK:
                        GetComponent<NavMeshAgent>().speed = 0f;
                        GetComponent<NavMeshAgent>().velocity = Vector3.zero;
                        GetComponent<NavMeshAgent>().isStopped = true;
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.IDLEFORCED:
                        StartNavigation();
                        GetComponent<NavMeshAgent>().enabled = true;
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.SLEEP:
                        EnableNPC();
                        SpawnOutsideHouse();
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.SIT:
                        GetComponent<NavMeshAgent>().enabled = true;
                        currentState = NPCState.IDLE;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.TALK:
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
                        StopNavigating();
                        graphics.transform.LookAt(GameManager.current.playerObject.transform.position);
                        currentState = NPCState.IDLEFORCED;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.SIT:
                        currentState = NPCState.IDLEFORCED;
                        npcAnimator.SetTrigger("SIT");
                        break;
                    case NPCState.WALK:
                        StopNavigating();
                        graphics.transform.LookAt(GameManager.current.playerObject.transform.position);
                        currentState = NPCState.IDLEFORCED;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    case NPCState.TALK:
                        StopNavigating();
                        graphics.transform.LookAt(GameManager.current.playerObject.transform.position);
                        currentState = NPCState.IDLEFORCED;
                        npcAnimator.SetTrigger("IDLE");
                        break;
                    default:
                        break;
                }
                break;
            case NPCState.SLEEP:
                switch (currentState)
                {
                    case NPCState.IDLE:
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
                        GetComponent<NavMeshAgent>().speed = moveSpeed;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        currentState = NPCState.WALK;
                        npcAnimator.SetTrigger("WALK");
                        break;
                    case NPCState.SIT:
                        GetComponent<NavMeshAgent>().enabled = true;
                        GetComponent<NavMeshAgent>().speed = moveSpeed;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        currentState = NPCState.WALK;
                        npcAnimator.SetTrigger("WALK");
                        break;
                    case NPCState.TALK:
                        foreach (NPC npc in talkingTo)
                        {
                            if(npc != this)
                            {
                                npc.talkingTo.Remove(this);
                            }
                        }
                        talkingTo.Clear();
                        GetComponent<NavMeshAgent>().speed = moveSpeed;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        currentState = NPCState.WALK;
                        npcAnimator.SetTrigger("WALK");
                        break;
                    case NPCState.WALK:
                        break;
                    case NPCState.SLEEP:
                        EnableNPC();
                        SpawnOutsideHouse();
                        GetComponent<NavMeshAgent>().enabled = true;
                        GetComponent<NavMeshAgent>().speed = moveSpeed;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        currentState = NPCState.WALK;
                        npcAnimator.SetTrigger("WALK");
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
                        if(!isFleeing)
                            if (currentTargetQueue.Count != 0)
                            {
                                targetBeforeFleeing = currentTargetQueue.ToArray()[currentTargetQueue.Count - 1];
                            }
                            else
                            {
                                targetBeforeFleeing = currentTarget;
                            }
                        ChangeTargetAfterHourPassed(houseTarget);
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        GetComponent<NavMeshAgent>().speed = fleeSpeed;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        currentState = NPCState.FLEE;
                        npcAnimator.SetTrigger("FLEE");
                        isFleeing = true;
                        break;
                    case NPCState.SIT:
                        if (!isFleeing)
                            if (currentTargetQueue.Count != 0)
                            {
                                targetBeforeFleeing = currentTargetQueue.ToArray()[currentTargetQueue.Count - 1];
                            }
                            else
                            {
                                targetBeforeFleeing = currentTarget;
                            }
                        ChangeTargetAfterHourPassed(houseTarget);
                        GetComponent<NavMeshAgent>().enabled = true;
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        GetComponent<NavMeshAgent>().speed = fleeSpeed;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        currentState = NPCState.FLEE;
                        npcAnimator.SetTrigger("FLEE");
                        isFleeing = true;
                        break;
                    case NPCState.TALK:
                        if (!isFleeing)
                            if (currentTargetQueue.Count != 0)
                            {
                                targetBeforeFleeing = currentTargetQueue.ToArray()[currentTargetQueue.Count - 1];
                            }
                            else
                            {
                                targetBeforeFleeing = currentTarget;
                            }
                        foreach (NPC npc in talkingTo)
                        {
                            if (npc != this)
                            {
                                npc.talkingTo.Remove(this);
                            }
                        }
                        talkingTo.Clear();
                        ChangeTargetAfterHourPassed(houseTarget);
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        GetComponent<NavMeshAgent>().speed = fleeSpeed;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        currentState = NPCState.FLEE;
                        npcAnimator.SetTrigger("FLEE");
                        isFleeing = true;
                        break;
                    case NPCState.WALK:
                        if (!isFleeing)
                        {
                            if(currentTargetQueue.Count != 0)
                            {
                                targetBeforeFleeing = currentTargetQueue.ToArray()[currentTargetQueue.Count - 1];
                            }
                            else
                            {
                                targetBeforeFleeing = currentTarget;
                            }
                        }
                        ChangeTargetAfterHourPassed(houseTarget);
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        GetComponent<NavMeshAgent>().speed = fleeSpeed;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        currentState = NPCState.FLEE;
                        npcAnimator.SetTrigger("FLEE");
                        isFleeing = true;
                        break;
                    case NPCState.IDLEFORCED:
                        if (!isFleeing)
                            if (currentTargetQueue.Count != 0)
                            {
                                targetBeforeFleeing = currentTargetQueue.ToArray()[currentTargetQueue.Count - 1];
                            }
                            else
                            {
                                targetBeforeFleeing = currentTarget;
                            }
                        DialogOptionManager.current.ShowDialogWindow(false, null);
                        StartNavigation();
                        ChangeTargetAfterHourPassed(houseTarget);
                        GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                        GetComponent<NavMeshAgent>().speed = fleeSpeed;
                        GetComponent<NavMeshAgent>().isStopped = false;
                        currentState = NPCState.FLEE;
                        npcAnimator.SetTrigger("FLEE");
                        isFleeing = true;
                        break;
                    default:
                        break;
                }
                break;
            case NPCState.SIT:
                switch(currentState)
                {
                    case NPCState.IDLE:
                        GetComponent<NavMeshAgent>().enabled = false;
                        transform.position = currentTarget.GetSittingTransform().position;
                        transform.rotation = currentTarget.GetSittingTransform().rotation;
                        currentState = NPCState.SIT;
                        npcAnimator.SetTrigger("SIT");
                        break;
                    case NPCState.IDLEFORCED:
                        GetComponent<NavMeshAgent>().enabled = false;
                        transform.position = currentTarget.GetSittingTransform().position;
                        transform.rotation = currentTarget.GetSittingTransform().rotation;
                        currentState = NPCState.SIT;
                        npcAnimator.SetTrigger("SIT");
                        break;
                    default:
                        break;
                }
                break;
            case NPCState.TALK:
                switch (currentState)
                {
                    case NPCState.WALK:
                        GetComponent<NavMeshAgent>().speed = 0f;
                        GetComponent<NavMeshAgent>().velocity = Vector3.zero;
                        GetComponent<NavMeshAgent>().isStopped = true;
                        currentState = NPCState.TALK;
                        npcAnimator.SetTrigger("TALK");
                        break;
                    case NPCState.IDLE:
                        currentState = NPCState.TALK;
                        npcAnimator.SetTrigger("TALK");
                        break;
                    default:
                        break;
                }
                break;
            case NPCState.COMBAT:
                currentState = NPCState.COMBAT;
                npcAnimator.SetLayerWeight(npcAnimator.GetLayerIndex("Combat"),1.0f);
                GetComponent<NavMeshAgent>().enabled = true;
                GetComponent<NavMeshAgent>().speed = combatSpeed;
                GetComponent<NavMeshAgent>().isStopped = false;
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

    private void ChangeTarget(NPCTarget nextTarget)
    {
        //("Called ChangeTarget");
        if(currentTargetQueue.Count == 0)
            currentTargetQueue = ReturnRoute(currentSceneName, nextTarget.GetTargetSceneName(), nextTarget);

        currentTarget = nextTarget;
    }

    private void ChangeTargetAfterHourPassed(NPCTarget nextTarget)
    {
        //(name + " has Called ChangeTarget Affter Hour Passed");
        currentTargetQueue = ReturnRoute(currentSceneName, nextTarget.GetTargetSceneName(), nextTarget);
        currentTarget = currentTargetQueue.Dequeue();
    }

    private void ResolveTarget()
    {
        //(name + " has ResolvedTarget");
        switch (currentTarget.GetNPCTargetType())
        {
            case NPCTargetType.BUILDING:
                GetComponent<NavMeshAgent>().Warp(currentTarget.GetRoutesTo().GetTargetTransform().position);
                currentSceneName = currentTarget.GetRoutesTo().GetTargetSceneName();
                ChangeTarget(currentTargetQueue.Dequeue());
                GetComponent<NavMeshAgent>().SetDestination(currentTarget.GetTargetTransform().position);
                ChangeState(NPCState.WALK);
                break;
            case NPCTargetType.SIT:
                ChangeState(NPCState.SIT);
                break;
            case NPCTargetType.HOME:
                ChangeState(NPCState.SLEEP);
                break;
            case NPCTargetType.PLACE:
                graphics.rotation = currentTarget.GetTargetTransform().rotation;
                ChangeState(NPCState.IDLE);
                break;
            default:
                break;
        }
    }

    private void DisableNPC()
    {
        GetComponent<CapsuleCollider>().enabled = false;
        GetComponent<NavMeshAgent>().enabled = false;
        graphics.gameObject.SetActive(false);
    }

    private void EnableNPC()
    {
        GetComponent<CapsuleCollider>().enabled = true;
        GetComponent<NavMeshAgent>().enabled = true;
        graphics.gameObject.SetActive(true);
    }

    private Queue<NPCTarget> ReturnRoute(SceneName npcScene, SceneName targetScene, NPCTarget nextTarget)
    {
        Queue<NPCTarget> newRoute = new Queue<NPCTarget>();

        string report = "Found path: ";

        switch (npcScene)
        {
            case SceneName.TOWN:
                switch (targetScene)
                {
                    case SceneName.TOWN:
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.SHERIFF:
                        newRoute.Enqueue(sheriffOutsideRouter);
                        report += sheriffOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.MERCHANT:
                        newRoute.Enqueue(merchantOutsideRouter);
                        report += merchantOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.SALOON:
                        newRoute.Enqueue(saloonOutsideRouter);
                        report += saloonOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.CHURCH:
                        newRoute.Enqueue(churchOutsideRouter);
                        report += churchOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    default:
                        break;
                }
                break;
            case SceneName.MERCHANT:
                switch (targetScene)
                {
                    case SceneName.MERCHANT:
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.TOWN:
                        newRoute.Enqueue(merchantInsideRouter);
                        report += merchantInsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.SHERIFF:
                        newRoute.Enqueue(merchantInsideRouter);
                        report += merchantInsideRouter.name + "->";
                        newRoute.Enqueue(sheriffOutsideRouter);
                        report += sheriffOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.SALOON:
                        newRoute.Enqueue(merchantInsideRouter);
                        report += merchantInsideRouter.name + "->";
                        newRoute.Enqueue(saloonOutsideRouter);
                        report += saloonOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.CHURCH:
                        newRoute.Enqueue(merchantInsideRouter);
                        report += merchantInsideRouter.name + "->";
                        newRoute.Enqueue(churchOutsideRouter);
                        report += churchOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    default:
                        break;
                }
                break;
            case SceneName.SHERIFF:
                switch (targetScene)
                {
                    case SceneName.SHERIFF:
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.TOWN:
                        newRoute.Enqueue(sheriffInsideRouter);
                        report += sheriffInsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.MERCHANT:
                        newRoute.Enqueue(sheriffInsideRouter);
                        report += sheriffInsideRouter.name + "->";
                        newRoute.Enqueue(merchantOutsideRouter);
                        report += merchantOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.SALOON:
                        newRoute.Enqueue(sheriffInsideRouter);
                        report += sheriffInsideRouter.name + "->";
                        newRoute.Enqueue(saloonOutsideRouter);
                        report += saloonOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.CHURCH:
                        newRoute.Enqueue(sheriffInsideRouter);
                        report += sheriffInsideRouter.name + "->";
                        newRoute.Enqueue(churchOutsideRouter);
                        report += churchOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    default:
                        break;
                }
                break;
            case SceneName.SALOON:
                switch (targetScene)
                {
                    case SceneName.SALOON:
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.TOWN:
                        newRoute.Enqueue(saloonInsideRouter);
                        report += saloonInsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.MERCHANT:
                        newRoute.Enqueue(saloonInsideRouter);
                        report += saloonInsideRouter.name + "->";
                        newRoute.Enqueue(merchantOutsideRouter);
                        report += merchantOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.SHERIFF:
                        newRoute.Enqueue(saloonInsideRouter);
                        report += saloonInsideRouter.name + "->";
                        newRoute.Enqueue(sheriffOutsideRouter);
                        report += sheriffOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.CHURCH:
                        newRoute.Enqueue(saloonInsideRouter);
                        report += saloonInsideRouter.name + "->";
                        newRoute.Enqueue(churchOutsideRouter);
                        report += churchOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    default:
                        break;
                }
                break;
            case SceneName.CHURCH:
                switch (targetScene)
                {
                    case SceneName.CHURCH:
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.TOWN:
                        newRoute.Enqueue(churchInsideRouter);
                        report += churchInsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.MERCHANT:
                        newRoute.Enqueue(churchInsideRouter);
                        report += churchInsideRouter.name + "->";
                        newRoute.Enqueue(merchantOutsideRouter);
                        report += merchantOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.SHERIFF:
                        newRoute.Enqueue(churchInsideRouter);
                        report += churchInsideRouter.name + "->";
                        newRoute.Enqueue(sheriffOutsideRouter);
                        report += sheriffOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    case SceneName.SALOON:
                        newRoute.Enqueue(churchInsideRouter);
                        report += churchInsideRouter.name + "->";
                        newRoute.Enqueue(saloonOutsideRouter);
                        report += saloonOutsideRouter.name + "->";
                        newRoute.Enqueue(nextTarget);
                        report += nextTarget.name;
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

        //Debug.Log(report);
        return newRoute;
    }

}
