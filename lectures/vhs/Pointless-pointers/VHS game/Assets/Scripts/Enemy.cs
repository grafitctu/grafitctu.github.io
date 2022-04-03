using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum EnemyState
{
    wander,
    talking,
    idle,
    walk,
    attack,
    preparesToAttack,
    stagger,
    dead 
}

public class Enemy : MonoBehaviour
{
    public EnemyState currentState;
    public float health;
    public FloatValue maxHealth;
    public string enemyName;
    public int baseAttack;
    public float movingSpeed;

    private void Awake()
    {        
        health = maxHealth.initialValue;
    }

    private void TakeDamage(float damage)
    {
        
        health -= damage;
        if (health <= 0)
        {
            
            StartCoroutine(die());
           
        }
            //this.gameObject.SetActive(false);
            
    }
    IEnumerator die()
    {
        
        this.gameObject.GetComponent<Knockback>().enabled = false;
        this.gameObject.GetComponent<WalkingNPC>().enabled = false;
        Animator animator = GetComponent<Animator>();        
       ChangeState(EnemyState.dead);        
        animator.SetBool("alive", false);
        GameObject[] NPCs = GameObject.FindGameObjectsWithTag("NPC");
        foreach (GameObject NPC in NPCs)
        {
            NPC.BroadcastMessage("OnSomeoneDead",
                GetComponent<Rigidbody2D>().position,
                 SendMessageOptions.DontRequireReceiver);
        }
        yield return new WaitForSeconds(5);
        //this.gameObject.SetActive(false);
        Object.Destroy(this.gameObject);
        
        
    }
    public void Knock(Rigidbody2D rigidbody, float knockTime, float damage)
    {
        StartCoroutine(this.KnockCo(rigidbody, knockTime));
        TakeDamage(damage);
    }

    private IEnumerator KnockCo(Rigidbody2D rigidbody2D, float knocktime)
    {
        if (rigidbody2D != null)
        {
            ChangeState(EnemyState.stagger);
            GetComponent<WalkingNPC>().setStopped(true);
            yield return new WaitForSeconds(knocktime);
            rigidbody2D.velocity = Vector2.zero;
           ChangeState(EnemyState.walk);
            GetComponent<WalkingNPC>().setStopped(false);

        }
    }
    public void ChangeState(EnemyState newState)
    {
        if (this.currentState != newState && this.currentState != EnemyState.dead) 
            this.currentState = newState;
    }
   
    
}
