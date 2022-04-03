using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class RotateRandomly : MonoBehaviour
{
    //Desired angle the windzone will rotate by
	private float destination;
    //Determines whether to rotate in positive or negative direction
	private int direction;

	// Chooses an angle and direction and then rotates this object each frame by a small amount until the destination is reached.
    void Update()
    {
	    if (destination<=0.0f)
	    {
		    destination = Random.Range(-360.0f, 360.0f);
		    direction = Random.value >= 0.5 ? 1 : -1;
	    }

	    var t = Time.deltaTime * Random.Range(0, 4);
        transform.Rotate(transform.up, t * direction);
        destination -= t;
    }
}
