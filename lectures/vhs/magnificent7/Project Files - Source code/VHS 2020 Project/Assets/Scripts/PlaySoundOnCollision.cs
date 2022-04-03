using System.Collections;
using System.Collections.Generic;
using JetBrains.Annotations;
using UnityEngine;

public class PlaySoundOnCollision : MonoBehaviour
{
	public SoundManager.StepMaterial Material;
	public AudioClip[] customClips;
	[Range(0,2)]
	public float Volume = 0.3f;
	void Start()
	{

	}

	void Update()
	{

	}

	[UsedImplicitly]
	void OnCollisionEnter(Collision col)
	{
		PlaySoundOnCollision p;
		if ((p= col.gameObject.GetComponent<PlaySoundOnCollision>()) != null && p.Material == Material && col.gameObject.GetInstanceID() > GetInstanceID())
		{
			return;
		}
	    if (Material != SoundManager.StepMaterial.Custom)
	    {
		    AudioSource.PlayClipAtPoint(SoundManager.Current.GetRandomCollision(Material),col.GetContact(0).point, Volume * Mathf.Clamp(col.relativeVelocity.magnitude, 0, 2));
	    }
	    else
	    {
		    AudioSource.PlayClipAtPoint(customClips[Random.Range(0,customClips.Length)], col.GetContact(0).point, Volume * Mathf.Clamp(col.relativeVelocity.magnitude,0,2));
	    }
	}

}
