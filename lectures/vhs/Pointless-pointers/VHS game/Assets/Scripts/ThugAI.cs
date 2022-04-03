using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Pathfinding;
using System;


public class ThugAI : WalkingNPC
{
    public Transform[] waypoints;
    
    public bool cycling = true;    
    
    private Transform attackTarget;
    int numberOfFollowingTarget = 0;


    public void SetAttackTarget(Transform target)
    {
        this.attackTarget = target;
        SetTarget(attackTarget);       
    }
    public override void ActionOnPathEnd()
    {
        if (attackTarget != null)
        {
            SetTarget(attackTarget);
            seeker.StartPath(rb.position, attackTarget.position, OnPathComplete);
        }
        else
        {
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
    }
   
}
