using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ThiefFollower : WalkingNPC {
    public Transform standHere;
    public Transform followOffset;
// Start is called before the first frame update
protected override void Start()
{
    base.Start();
        //target = GameObject.FindWithTag("PlayerOffset").transform;
        target = followOffset;
}
/*public override void UpdatePath()
{
    if (target == null)
    {
        target = GameObject.FindWithTag("PlayerOffset").transform;
    }
    base.UpdatePath();

}*/
public override void FixedUpdate()
{
    if (target == null) return;
    if (Vector2.Distance(transform.position, target.transform.position) < 0.7)
    {
        GetComponent<Animator>().SetBool("moving", false);
    }
    else if (!stopped)
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
public void SetStandingPlace()
    {
        SetTarget(standHere);
    }
public IEnumerator Die()
{
    this.setStopped(true);
    Animator animator = GetComponent<Animator>();
    animator.SetBool("alive", false);
    yield return new WaitForSeconds(5);
    this.gameObject.SetActive(false);
}
}
