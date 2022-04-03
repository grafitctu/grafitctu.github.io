using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Pathfinding;

public class Thug : Enemy
{
    
    public Transform target;
    public float attackRadius;
    public ThugAI ai;

    private Animator animator;
    private Rigidbody2D myRigidbody;

    private GameObject tmp;
    private bool inCombat = false;
    private TalkingNPC talkScript;    
   
    // Start is called before the first frame update
    void Start()
    {
        talkScript = GetComponent<TalkingNPC>();
        animator = GetComponent<Animator>();
        this.currentState = EnemyState.walk;
        myRigidbody = GetComponent<Rigidbody2D>();
        this.ai = GetComponent<ThugAI>();
        disableCombat();       


    }

    void disableCombat()
    {
        this.gameObject.GetComponent<Knockback>().enabled = false;
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


    public void Agro()
    {
        target = GameObject.FindWithTag("Player").transform;
        inCombat = true;
        ai.setStopped(true);
        ai.SetAttackTarget(target);
        ai.setStopped(false);
        this.gameObject.GetComponent<Knockback>().enabled = true;
        //StartCoroutine(RestCo());
    }

 
    public void Interrupt()
    {
        if (!inCombat)
        {
            ai.setStopped(true);
            talkScript.setTalking();
            this.currentState = EnemyState.talking;
            animator.SetBool("moving", false);
        }
    }
    public void Resume()
    {
        if (!inCombat)
        {
            talkScript.setNotTalking();
            this.currentState = EnemyState.walk;            
            animator.SetBool("moving", true);
            ai.setStopped(false);
        }
    }

}
