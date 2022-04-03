using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Random = UnityEngine.Random;

public class MusicManager : MonoBehaviour
{
	public enum SoundClipState
	{
		Off,
		Ready,
		Attack,
		Playing,
		Release,
		Cooldown
	}

	public enum Priority
	{
		Ambient,
		Cutscene,
		OnDemand
	}

    public static MusicManager current;
    private AudioSource musicSource;

    public AudioClip[] dayMusic;
    public AudioClip[] nightMusic;

    public float volumeModifier;
	
    [SerializeField]
    private float timer;
    [SerializeField]
    private SoundClipState state;
    [SerializeField]
    private AudioClip next;
    private Priority currentPriority;
    private Priority nextPriority;
    private float lastTime;
    public void Awake()
    {
        if(current == null)
        {
            current = this;
        }

        musicSource = GetComponent<AudioSource>();
    }

    public void Start()
    {
	    TimeManager.current.onHourPassed.AddListener(HourChanged);
	    lastTime = TimeManager.current.GetCurrentTime();
    }

	public void Update()
    {
	    switch (state)
	    {
		    case SoundClipState.Off:
			    if (next != null)
			    {
				    timer = 0;
				    state = SoundClipState.Ready;
			    }
			    break;
			case SoundClipState.Ready:
				musicSource.clip = next;
				next = null;
				currentPriority = nextPriority;
				timer = 0;
				if (musicSource.isPlaying)
				{
					state = SoundClipState.Attack;
				}
				else
				{
					state = SoundClipState.Playing;
				}
				musicSource.Play();
				break;
		    case SoundClipState.Attack:
			    if (timer > 2.0f)
			    {
				    state = SoundClipState.Playing;
				    timer = 0;
			    }
			    else
			    {
				    musicSource.volume = Easings.Interpolate(timer / 2.0f, Easings.Functions.CubicEaseIn)* volumeModifier;
			    }
			    break;
		    case SoundClipState.Playing:
			    if (musicSource.isPlaying)
			    {

			    }
			    else
			    {
				    timer = 0;
				    state = SoundClipState.Release;
			    }
			    break;
		    case SoundClipState.Release:
			    if (timer > 2.0f)
			    {
				    state = SoundClipState.Cooldown;
			    }
			    else
			    {
				    musicSource.volume = Easings.Interpolate((1 - timer / 2.0f), Easings.Functions.CubicEaseIn) * volumeModifier;
			    }
			    break;
		    case SoundClipState.Cooldown:
			    if (timer > 10.0f)
			    {
				    state = SoundClipState.Off;
				    timer = 0;
				    musicSource.volume = 0;
			    }
			    break;
	    }
	    timer += Time.deltaTime;
	}

    private void HourChanged()
    {
	    float curTime = TimeManager.current.GetCurrentTime();
	    if (curTime > 19 || curTime < 7)
	    {
			//Night music
			next = nightMusic[Random.Range(0,nightMusic.Length)];
	    }
		else
	    {
			//Day music
			next = dayMusic[Random.Range(0, dayMusic.Length)];
	    }

		if (!musicSource.isPlaying)
	    {
	    }

	    lastTime = curTime;

    }

    public void ChangeSong(AudioClip clip)
    {
	    next = clip;
	    timer = 0;
	    state = SoundClipState.Release;
    }

    public void PlaySong(AudioClip clip)
    {
		next = clip;
		timer = 0;
		state = SoundClipState.Ready;
	}
}
