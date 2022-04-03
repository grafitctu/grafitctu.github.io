using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerInteract : MonoBehaviour
{   
    
    private BoxCollider2D interactCollider;
    private bool isActive = false;    
    // Start is called before the first frame update
    void Start()
    {
        interactCollider = GetComponent<BoxCollider2D>();
    }

    // Update is called once per frame
    void FixedUpdate()
    {
        
        if (Input.GetKey(KeyCode.E))
        {
            interactCollider.enabled = true;  
        }
        else
        {
            interactCollider.enabled = false;
        }
    }
}
