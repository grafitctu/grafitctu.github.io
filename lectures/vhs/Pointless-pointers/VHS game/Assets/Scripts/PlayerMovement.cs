using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum PlayerState
{
    idle,
    walk,
    attack,
    interact,
    stagger
}

public class PlayerMovement : MonoBehaviour
{
    [SerializeField]
    private RuntimeAnimatorController controller_thief;
    [SerializeField]
    private RuntimeAnimatorController controller_rich;
    [SerializeField]
    private RuntimeAnimatorController controller_detective;
    
    private Transform office;

    public float speed;
    private Rigidbody2D myRigidBody;
    private Vector3 change;
    private bool movementEnabled = true;
    private Animator animator;
    public PlayerState currentState;
    // Start is called before the first frame update
    void Start()
    {
        office = GameObject.Find("OfficeEntranceDummy").transform;
        currentState = PlayerState.walk;
        myRigidBody = GetComponent<Rigidbody2D>();
        animator = GetComponent<Animator>();
        animator.SetFloat("moveX", 0);
        animator.SetFloat("moveY", -1);
    }
    void disableMovement()
    {
        movementEnabled = false;
    }
    void enableMovement()
    {
        movementEnabled = true;
    }
    public void ChangeClothes()
    {
        
        Animator animator = GetComponent<Animator>();
        if (animator.runtimeAnimatorController == controller_thief)
        {
            animator.runtimeAnimatorController = controller_rich;
        }
        else if (animator.runtimeAnimatorController == controller_rich)
        {
            animator.runtimeAnimatorController = controller_thief;
        }
    }
    public void SetThiefController()
    {
            animator.runtimeAnimatorController = controller_thief;
        
    }
    public void SetDetectiveController()
    {
        animator.runtimeAnimatorController = controller_detective;

    }
    
    public void TeleportToOffice()
    {
        this.transform.position = office.position;
    }
    // Update is called once per frame
    void FixedUpdate()
    {
        if (!movementEnabled) return;
        change = Vector3.zero;

        // GetAxisRaw = při stisku klávesy je to hned 1/0 = zmáčknuto/nezmáčknuto
        // GetAxis = dělá akcelerací z 0 na 1 (po desetinách)

        change.x = Input.GetAxisRaw("Horizontal");
        change.y = Input.GetAxisRaw("Vertical");
       
        if (Input.GetButtonDown("attack") && currentState != PlayerState.attack
            && currentState != PlayerState.stagger)
            StartCoroutine(AttackCo());
        
        else if (currentState == PlayerState.walk || currentState == PlayerState.idle)
            UpdateAnimationAndMove();
    }

    private IEnumerator AttackCo()
    {
        
        animator.SetBool("attacking", true);
        currentState = PlayerState.attack;
        yield return null;
        animator.SetBool("attacking", false);
        yield return new WaitForSeconds(.5f);
        currentState = PlayerState.walk;
    }

    void UpdateAnimationAndMove()
    {
        //Debug.Log(change);
        if (change != Vector3.zero)
        {
            animator.SetBool("moving", true);
            MoveCharacter();
            if (change.x > 0)
                this.SetAnimFloat(Vector2.right);
            if (change.x < 0)
                this.SetAnimFloat(Vector2.left);

            if (change.x == 0 && change.y > 0)
                this.SetAnimFloat(Vector2.up);
            if (change.x == 0 && change.y < 0)
                this.SetAnimFloat(Vector2.down);
        }
        else
        {
            animator.SetBool("moving", false);
        }

    }

    private void SetAnimFloat(Vector2 setVector)
    {
        Animator animator = GetComponent<Animator>();
        animator.SetFloat("moveX", setVector.x);
        animator.SetFloat("moveY", setVector.y);
    }


    void MoveCharacter()
    {
        var distance = change;
        distance.Normalize();
        myRigidBody.MovePosition(
            transform.position + distance * speed * Time.deltaTime
            );
    }
    public void Knock(float knocktime)
    {
        StartCoroutine(KnockCo(knocktime));
    }

    private IEnumerator KnockCo(float knocktime)
    {
        if (myRigidBody != null)
        {
            yield return new WaitForSeconds(knocktime);
            myRigidBody.velocity = Vector2.zero;
            this.currentState = PlayerState.idle;
        }
    }
}
