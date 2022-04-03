using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    float xMove = 0f;
    float zMove = 0f;

    private void FixedUpdate()
    {
        xMove = Input.GetAxisRaw("Horizontal");
        zMove = Input.GetAxisRaw("Vertical");

        Vector3 moveVector = transform.right * xMove + transform.forward * zMove;
        GetComponent<MoveVelocity>().SetVelocity(moveVector);
        GetComponent<Player_Base>().PlayAnimation(moveVector);
    }
}
