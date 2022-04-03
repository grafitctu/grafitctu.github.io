using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Pathfinding;
using System;

public class WalkingNPC : MonoBehaviour
{
    public Transform target;

    public float speed = 200f;
    public float nextWaypointDistance = 3f;    
    
    protected bool stopped = false;    
    
    protected Path path;
    protected int currentWaypoint = 0;
    protected bool reachedEndOfPath = false;

    protected Vector3 nextPosition;

    protected Seeker seeker;
    protected Rigidbody2D rb;    
    
    
    public void setStopped(bool stopped)
    {
        this.stopped = stopped;
    }

    public bool getStopped()
    {
        return this.stopped;
    }

    public void SetTarget(Transform target)
    {
        this.target = target;
        seeker.CancelCurrentPathRequest();
        seeker.StartPath(rb.position, target.position, OnPathComplete);
    }

    public Vector3 GetTargetPosition()
    {
        return this.target.position;
    }

    // Start is called before the first frame update
    protected virtual void Start()
    {
        seeker = GetComponent<Seeker>();
        rb = GetComponent<Rigidbody2D>();

        InvokeRepeating("UpdatePath", 0f, .5f);

    }

    public virtual void UpdatePath()
    {
        if (seeker.IsDone())
        {         
            if(path != null && currentWaypoint < path.vectorPath.Count)
            {
                Vector2 direction = (((Vector2)path.vectorPath[currentWaypoint] - rb.position).normalized);               
                direction += rb.position;
                Vector3 position = new Vector3(direction.x, direction.y, 0);
                seeker.StartPath(position, target.position, OnPathComplete);
            }
            else seeker.StartPath(rb.position, target.position, OnPathComplete);

        }
       
        
    }

    public void OnPathComplete(Path p)
    {
        if (!p.error)
        {
            path = p;
            currentWaypoint = 0;            
            
        }
    }

    // Update is called once per frame
    public virtual void FixedUpdate()
    {
        MoveToTarget();
    }
    public void MoveToTarget()
    {
        if (path == null || stopped || target == null)
        {
            return;
        }

        if (currentWaypoint >= path.vectorPath.Count)
        {
            currentWaypoint = 0;
            reachedEndOfPath = true;

            ActionOnPathEnd();
        }
        else
        {
            reachedEndOfPath = false;
        }

        Vector2 direction = ((Vector2)path.vectorPath[currentWaypoint] - rb.position).normalized;

        SetAnimation(direction);

        nextPosition = Vector3.MoveTowards(rb.position, (Vector2)path.vectorPath[currentWaypoint], speed * Time.deltaTime);

        rb.MovePosition(nextPosition);

        float distance = Vector2.Distance(rb.position, path.vectorPath[currentWaypoint]);

        if (Math.Abs(distance) < nextWaypointDistance)
        {
            currentWaypoint++;
        }
    }
    public virtual void ActionOnPathEnd()
    {
        Debug.Log("Jsem tu...");        
        
    }
    public void SetAnimation(Vector2 direction)
    {

        //horizontalni        
        if (direction.x > 0)
            this.SetAnimFloat(Vector2.right);
        else if (direction.x < 0)
            this.SetAnimFloat(Vector2.left);

        else if (direction.x == 0)
            this.SetAnimFloat(Vector2.down);
        else if (direction.x == 0)
            this.SetAnimFloat(Vector2.up);
    }
    protected void SetAnimFloat(Vector2 setVector)
    {
        Animator animator = GetComponent<Animator>();
        animator.SetFloat("moveX", setVector.x);
        animator.SetFloat("moveY", setVector.y);
    }
}
