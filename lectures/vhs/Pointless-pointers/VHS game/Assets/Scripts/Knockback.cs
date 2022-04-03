using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Knockback : MonoBehaviour
{
    public float thrust; // síla která bude působit proti objektu
    public float knocktime;
    public float damage;

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (!this.isActiveAndEnabled) return;
        if(other.gameObject.CompareTag("Enemy") || other.gameObject.CompareTag("Player") ||other.gameObject.CompareTag("Ally"))
        {
            Rigidbody2D hit = other.GetComponent<Rigidbody2D>();
            if (hit != null)
            {
                Vector2 difference = hit.transform.position - transform.position;
                difference = difference.normalized * thrust;
                //hit hrace do nepritele
                if (other.gameObject.CompareTag("Enemy") && other.isTrigger)
                {
                    
                    //hit.GetComponent<Enemy>().currentState = EnemyState.stagger;
                    hit.AddForce(difference, ForceMode2D.Impulse);
                    other.GetComponent<Enemy>().Knock(hit, knocktime, damage);
                }
                //hit nepritele do hrace
                else if (other.gameObject.CompareTag("Player") && gameObject.CompareTag("Enemy"))
                {
                    
                    gameObject.GetComponent<Enemy>().ChangeState(EnemyState.preparesToAttack);
                    if(gameObject.GetComponent<Enemy>().currentState != EnemyState.dead)
                    {
                        hit.AddForce(difference, ForceMode2D.Impulse);
                        hit.GetComponent<PlayerMovement>().currentState = PlayerState.stagger;
                        hit.GetComponent<PlayerMovement>().Knock(knocktime);
                    }                    
                }
                //hit nepritele do spojence
                else if(other.gameObject.CompareTag("Ally") && gameObject.CompareTag("Enemy"))
                {
                    //Debug.Log("bum");
                    gameObject.GetComponent<Enemy>().ChangeState(EnemyState.preparesToAttack);
                    

                }
            }
        }
    }
    private void OnTriggerStay2D(Collider2D other)
    {
        if (!this.isActiveAndEnabled) return;
        if (other.gameObject.CompareTag("Ally") && gameObject.CompareTag("Enemy"))            
        {            
             gameObject.GetComponent<Enemy>().ChangeState(EnemyState.preparesToAttack);   
            
        }
    }
    private IEnumerator KnockCo(Rigidbody2D enemy)
    {
        if (enemy != null)
        {
            yield return new WaitForSeconds(knocktime);
            enemy.velocity = Vector2.zero;            
            enemy.GetComponent<Enemy>().currentState = EnemyState.idle;
        }
    }
}
