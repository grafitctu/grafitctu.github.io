using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Guard : Enemy
{
    public Transform target;
    public float chaseRadius;
    public float attackRadius;
    public float moveSpeed;

    private Animator animator;
    private Rigidbody2D myRigidbody;

    private GameObject tmp;
    private bool inCombat = false;

    // Start is called before the first frame update
    void Start()
    {
        animator = GetComponent<Animator>();
        this.currentState = EnemyState.idle;
        myRigidbody = GetComponent<Rigidbody2D>();
        this.gameObject.GetComponent<Knockback>().enabled = false;
        //TEMPORARY
        tmp = new GameObject();
        RandomTarget();
        

    }
    void RandomTarget()
    {
        
        Destroy(tmp);
        tmp = new GameObject();
        Vector3 position = new Vector3(Random.Range(-30.0f, 30.0f), Random.Range(-23.0f, 23.0f), gameObject.transform.position.z);
        tmp.transform.position = position;
        target = tmp.transform;
    }

    // Update is called once per frame
    void FixedUpdate()
    {
        this.CheckDistance();
    }
    private void Update()
    {
        if (currentState == EnemyState.preparesToAttack)
            StartCoroutine(AttackCo());
    }

    private IEnumerator AttackCo()
    {
        animator.SetBool("attacking", true);
        currentState = EnemyState.attack;
        yield return null;
        animator.SetBool("attacking", false);
        yield return new WaitForSeconds(.5f);
        currentState = EnemyState.walk;
    }

    void CheckDistance()
    {
       
        if (
            Vector3.Distance(target.position, transform.position) <= chaseRadius
            && Vector3.Distance(target.position, transform.position) > attackRadius
            && (this.currentState == EnemyState.idle || this.currentState == EnemyState.walk || this.currentState == EnemyState.wander)
            )
        {
            Vector3 temp = Vector3.MoveTowards(
                transform.position, target.position, moveSpeed * Time.deltaTime);

            ChangeAnim(temp - transform.position);
            myRigidbody.MovePosition(temp);
            ChangeState(EnemyState.walk);
            animator.SetBool("moving", true);
        }
        else
        {
            if(!inCombat) RandomTarget();
            animator.SetBool("moving", false);            
        }        
    }

    private void ChangeAnim(Vector2 direction)
    {
        Vector2 temp = Vector2.zero;
        if (Mathf.Abs(direction.x) > Mathf.Abs(direction.y))
        {
            if (direction.x < 0)
                this.SetAnimFloat(Vector2.left);
            else if (direction.x > 0)
                this.SetAnimFloat(Vector2.right);
        }
        else if (Mathf.Abs(direction.y) > Mathf.Abs(direction.x))
        {
            if (direction.y > 0)
                this.SetAnimFloat(Vector2.up);
            else if (direction.y < 0)
                this.SetAnimFloat(Vector2.down);
        }
    }

    private void SetAnimFloat(Vector2 setVector)
    {
        animator.SetFloat("moveX", setVector.x);
        animator.SetFloat("moveY", setVector.y);
    }
    public void agro()
    {
        target = GameObject.FindWithTag("Player").transform;
        inCombat = true;
        this.gameObject.GetComponent<Knockback>().enabled = true;
    }
    
}
