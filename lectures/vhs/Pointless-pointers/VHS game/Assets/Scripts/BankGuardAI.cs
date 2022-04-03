using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Pathfinding;
using System;


public class BankGuardAI : WalkingNPC
{
    private Animator animator;
    protected override void Start()
    {
        animator = GetComponent<Animator>();
        BankGuardCombat combat = GetComponent<BankGuardCombat>();
        if (this.target == null)
        {
            this.target = GameObject.FindWithTag("Player").transform;           
        }
       
        seeker = GetComponent<Seeker>();
        rb = GetComponent<Rigidbody2D>();

        InvokeRepeating("UpdatePath", 0f, .5f);
        animator.SetBool("moving", true);        
    }
    public override void ActionOnPathEnd()
    {
            SetTarget(this.target);
            seeker.StartPath(rb.position, this.target.position, OnPathComplete);
      
    }
    public void Spawn()
    {
        this.gameObject.SetActive(true);
    }
    /*public void SetPlayerTarget()
    {        
        setStopped(true);
        SetTarget(GameObject.FindWithTag("Player").transform);
        setStopped(false);
    }*/

}
