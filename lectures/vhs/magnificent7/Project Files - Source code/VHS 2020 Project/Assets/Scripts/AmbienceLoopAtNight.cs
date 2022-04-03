using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AmbienceLoopAtNight : MonoBehaviour
{
	public AudioClip[] clips;
	public AudioSource source;

    // Start is called before the first frame update
    void Start()
    {
        TimeManager.current.onHourPassed.AddListener(AddHour);
    }

    void AddHour()
    {
	    int currentTime = TimeManager.current.GetCurrentTime();
	    if (currentTime > 18 || currentTime < 6)
	    {
		    if (!source.isPlaying)
		    {
			    source.clip = clips[Random.Range(0, clips.Length)];
			    source.loop = true;
				source.Play();
		    }
	    }
	    else
	    {
			source.Stop();
	    }
    }
}
