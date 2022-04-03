using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MoveVelocity : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 0f;
    private float lastMoveSpeed = 0f;

    private Vector3 velocityVector = Vector3.zero;
    private Rigidbody rigidbody = null;
    private Player_Base playerBase = null;

    private void Awake()
    {
        rigidbody = GetComponent<Rigidbody>();
        playerBase = GetComponent<Player_Base>();
        lastMoveSpeed = moveSpeed;
    }

    public void SetVelocity(Vector3 velocityVector)
    {
        this.velocityVector = velocityVector;
    }

    public void StopMoving()
    {
        lastMoveSpeed = moveSpeed;
        moveSpeed = 0f;
    }

    public void StartMoving()
    {
        moveSpeed = lastMoveSpeed;
    }

    private void FixedUpdate()
    {
        rigidbody.velocity = velocityVector * moveSpeed;
    }
}
