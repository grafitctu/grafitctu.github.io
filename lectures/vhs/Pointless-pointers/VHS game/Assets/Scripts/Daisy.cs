using Fungus;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Daisy : WalkingNPC
{
    public float reactionDistance = 6;
    // Start is called before the first frame update
    protected override void Start()
    {        
        base.Start();        
        this.setStopped(true);
    }
    public override void UpdatePath()
    {
        if(target == null)
        {
            target = GameObject.FindWithTag("PlayerOffset").transform;
        }
        base.UpdatePath();

    }
    public override void FixedUpdate()
    {
        if (target == null) return;
        if(Vector2.Distance(transform.position, target.transform.position) < 0.5)
        {
            GetComponent<Animator>().SetBool("moving", false);
        }
        else if(!stopped)
        {
            GetComponent<Animator>().SetBool("moving", true);
            base.FixedUpdate();
        }        
    }
    public override void ActionOnPathEnd()
    {
        GetComponent<Animator>().SetBool("moving", false);
        seeker.StartPath(rb.position, target.position, OnPathComplete);
    }
    public void Move()
    {
        this.setStopped(false);
    }
    public void Stop()
    {
        this.setStopped(true);
    }
    void OnSomeoneDead(Vector2 otherPosition)
    {

        Vector2 myPosition = GetComponent<Rigidbody2D>().position;
        
        if(Vector2.Distance(myPosition, otherPosition) < reactionDistance)
        {
            GetComponent<TalkingNPC>().setTalking();
            GetComponent<Flowchart>().ExecuteBlock("OnNearbyDeath");
        }

    }
    public IEnumerator Die() {
        this.setStopped(true);
        Animator animator = GetComponent<Animator>();
        animator.SetBool("alive", false);
        yield return new WaitForSeconds(5);
        this.gameObject.SetActive(false);
    }
}
