using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Pathfinding;
using Fungus;

public enum FishermanState
{
    Fishing,
    Selling
}
/*public class FishermanAI : MonoBehaviour
{
    //pathfinding
    public Transform[] targets;   
    public float speed = 200f;
    public float nextWaypointDistance = 3f;
    public bool cycling = false;
    public float waitTime = 1f;
    private bool stopped = false;
    private Vector3 targetPosition;
    
    Path path;
    int currentWaypoint = 0;
    bool reachedEndOfPath = false;

    int numberOfFollowingTarget = 0;

    Seeker seeker;
    Rigidbody2D rb;

    //fishng stuff
    private FishermanState state = FishermanState.Fishing;
    private int numOfFish = 0;
    public FoodStorage foodStorage;

    public void Stop()
    {
        this.stopped = true;
        GetComponent<Animator>().SetBool("moving", false);
    }
    public void Resume()
    {
        this.stopped = false;
        GetComponent<Animator>().SetBool("moving", true);
    }

    public bool getStopped()
    {
        return this.stopped;
    }
   
    public Vector3 getTargetPosition()
    {
        return this.targetPosition;
    }

    // Start is called before the first frame update
    void Start()
    {
        seeker = GetComponent<Seeker>();
        rb = GetComponent<Rigidbody2D>();

        InvokeRepeating("UpdatePath", 0f, .5f);
    }

    void UpdatePath()
    {
        if (seeker.IsDone())
        {  
            seeker.StartPath(rb.position, targets[numberOfFollowingTarget].position, OnPathComplete);
        }
    }

    void OnPathComplete(Path p)
    {
        if (!p.error)
        {          
            path = p;
            currentWaypoint = 0;
        }
     
    }

    // Update is called once per frame
    void FixedUpdate()
    {        
        if (path == null || stopped)
        {
            return;
        }

        if (currentWaypoint >= path.vectorPath.Count)
        {

            if (numberOfFollowingTarget < targets.Length - 1)
            {
                numberOfFollowingTarget++;
                currentWaypoint = 0;
            }
            else if (numberOfFollowingTarget >= targets.Length - 1 && cycling)
            {
                numberOfFollowingTarget = 0;
                currentWaypoint = 0;
            }
            else
            {
                reachedEndOfPath = true;
                return;
            }
            reachedEndOfPath = true;
            this.ActionOnPathEnd();
        }
        else
        {
            reachedEndOfPath = false;
        }

        Vector2 direction = ((Vector2)path.vectorPath[currentWaypoint] - rb.position).normalized;

        if(!reachedEndOfPath)SetAnimation(direction);


        targetPosition = Vector3.MoveTowards(rb.position, (Vector2)path.vectorPath[currentWaypoint], speed * Time.deltaTime);

        rb.MovePosition(targetPosition);

        float distance = Vector2.Distance(rb.position, path.vectorPath[currentWaypoint]);

        if (distance < nextWaypointDistance)
        {
            currentWaypoint++;
        }


    }
    void ActionOnPathEnd()
    {        
        seeker.StartPath(rb.position, targets[numberOfFollowingTarget].position, OnPathComplete);
        if (this.state == FishermanState.Fishing)
        {
            StartCoroutine(FishingCo());
            this.state = FishermanState.Selling;
        }
        else if (this.state == FishermanState.Selling)
        {
            StartCoroutine(SellingCo());
            
            this.state = FishermanState.Fishing;
        }
    }
    private IEnumerator FishingCo()
    {
        this.stopped = true;
        Animator animator = GetComponent<Animator>();
        animator.SetBool("moving", false);
        //animator.SetFloat("moveX", 0); animator.SetFloat("moveY", -1);
        
        yield return new WaitForSeconds(7.5f);
        this.numOfFish = 5;
        this.stopped = false;
        GetComponent<Animator>().SetBool("moving", true);
    }
    private IEnumerator SellingCo()
    {
        stopped = true;
        GetComponent<Animator>().SetBool("moving", false);
        //GetComponent<Animator>().SetFloat("moveX", 0); GetComponent<Animator>().SetFloat("moveY", -1);
        Flowchart.BroadcastFungusMessage("SellFish");
        yield return new WaitForSeconds(5f);
        this.foodStorage.AddResouores(numOfFish);
        numOfFish = 0;
        stopped = false;
        GetComponent<Animator>().SetBool("moving", true);
    }
    void SetAnimation(Vector2 direction)
    {
        Animator animator = GetComponent<Animator>();
        //horizontalni
        if (System.Math.Abs(direction.x) > System.Math.Abs(direction.y))
        {
            if (direction.x > 0) { animator.SetFloat("moveX", 1); animator.SetFloat("moveY", 0); }
            else { animator.SetFloat("moveX", -1); animator.SetFloat("moveY", 0); }
        }
        //vertikalni
        else
        {
            if (direction.y > 0) { animator.SetFloat("moveX", 0); animator.SetFloat("moveY", 1); }
            else { animator.SetFloat("moveX", 0); animator.SetFloat("moveY", -1); }
        }
    }
}*/
public class FishermanAI : WalkingNPC
{
    //pathfinding
    public Transform[] waypoints;
    
    public bool cycling = false;

    int numberOfFollowingTarget = 0;    

    //fishng stuff
    private FishermanState state = FishermanState.Fishing;
    private int numOfFish = 0;
    public FoodStorage foodStorage;

    public void Stop()
    {
        this.stopped = true;
        GetComponent<Animator>().SetBool("moving", false);
    }
    public void Resume()
    {
        this.stopped = false;
        GetComponent<Animator>().SetBool("moving", true);
    }
    


    public override void ActionOnPathEnd()
    {       
        //handle coroutines
        if (this.state == FishermanState.Fishing)
        {
            StartCoroutine(FishingCo());
            this.state = FishermanState.Selling;
        }
        else if (this.state == FishermanState.Selling)
        {
            StartCoroutine(SellingCo());

            this.state = FishermanState.Fishing;
        }
        //set next target
        if (numberOfFollowingTarget < waypoints.Length - 1)
        {
            numberOfFollowingTarget++;
        }
        else if (numberOfFollowingTarget >= waypoints.Length - 1 && cycling)
        {
            numberOfFollowingTarget = 0;
        }
        SetTarget(waypoints[numberOfFollowingTarget]);
        seeker.StartPath(rb.position, waypoints[numberOfFollowingTarget].position, OnPathComplete);
        
    }
    private IEnumerator FishingCo()
    {
        this.stopped = true;
        Animator animator = GetComponent<Animator>();
        animator.SetBool("moving", false);
        //animator.SetFloat("moveX", 0); animator.SetFloat("moveY", -1);

        yield return new WaitForSeconds(7.5f);
        this.numOfFish = 5;
        this.stopped = false;
        GetComponent<Animator>().SetBool("moving", true);
    }
    private IEnumerator SellingCo()
    {
        stopped = true;
        GetComponent<Animator>().SetBool("moving", false);
        //GetComponent<Animator>().SetFloat("moveX", 0); GetComponent<Animator>().SetFloat("moveY", -1);
        Flowchart.BroadcastFungusMessage("SellFish");
        yield return new WaitForSeconds(5f);
        this.foodStorage.AddResouores(numOfFish);
        numOfFish = 0;
        stopped = false;
        GetComponent<Animator>().SetBool("moving", true);
    }
   
}
