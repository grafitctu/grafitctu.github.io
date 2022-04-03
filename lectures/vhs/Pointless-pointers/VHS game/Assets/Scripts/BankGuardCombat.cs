using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Pathfinding;

public class BankGuardCombat : Enemy
{        
    public BankGuardAI ai;

    private Animator animator;
    private Rigidbody2D myRigidbody;
    
    private bool inCombat = true;    

    // Start is called before the first frame update
    void Start()
    {        
        animator = GetComponent<Animator>();
        this.currentState = EnemyState.walk;
        myRigidbody = GetComponent<Rigidbody2D>();
        this.ai = GetComponent<BankGuardAI>();
        
    }
   
    private void Update()
    {
        if (currentState == EnemyState.preparesToAttack)
            StartCoroutine(AttackCo());

        if (ai.getStopped())
        {
            animator.SetBool("moving", false);
            this.currentState = EnemyState.walk;
        }
        else
        {
            animator.SetBool("moving", true);
            this.currentState = EnemyState.idle;
        }

    }

    private IEnumerator AttackCo()
    {
        animator.SetBool("attacking", true);
        currentState = EnemyState.attack;
        this.ai.setStopped(true);
        yield return null;
        animator.SetBool("attacking", false);
        yield return new WaitForSeconds(.5f);
        if (currentState != EnemyState.talking)
            currentState = EnemyState.walk;
        this.ai.setStopped(false);
    }
    private IEnumerator RestCo()
    {
        animator.SetBool("moving", false);
        currentState = EnemyState.idle;
        yield return new WaitForSeconds(2.5f);
        if (currentState != EnemyState.talking)
            currentState = EnemyState.walk;

    }   

    public void Interrupt()
    {
        if (!inCombat)
        {
            ai.setStopped(true);            
            this.currentState = EnemyState.talking;
            animator.SetBool("moving", false);
        }
    }
    public void Resume()
    {
        if (!inCombat)
        {            
            this.currentState = EnemyState.walk;
            animator.SetBool("moving", true);
            ai.setStopped(false);
        }
    }

}
