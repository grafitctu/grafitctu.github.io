using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AmbiencePlayRandomly : MonoBehaviour
{
	public AudioClip[] clips;

	public float minDelay = 0;
	public float maxDelay = 5;
	private float timer = 0;

	public AudioSource source;

	void Start()
	{
		timer = Random.Range(minDelay, maxDelay);
	}
	// Update is called once per frame
	void Update()
    {
        if(timer > 0)
			timer -= Time.deltaTime;
        else
        {
	        timer = Random.Range(minDelay, maxDelay);
	        if (source && !source.isPlaying)
	        {
		        source.clip = clips[Random.Range(0, clips.Length)];
		        source.Play();
	        }
        }
    }
}
