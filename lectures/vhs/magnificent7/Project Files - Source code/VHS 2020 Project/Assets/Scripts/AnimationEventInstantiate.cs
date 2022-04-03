using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AnimationEventInstantiate : MonoBehaviour
{
	public GameObject PrefabToSpawn;

	// Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void Spawn()
    {
	    Instantiate(PrefabToSpawn, transform.position, Quaternion.identity);
    }
}
