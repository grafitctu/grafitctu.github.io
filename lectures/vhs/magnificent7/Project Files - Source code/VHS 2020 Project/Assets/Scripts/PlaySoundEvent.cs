using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class PlaySoundEvent : MonoBehaviour
{
	public AudioClip[] Clips;

	[Tooltip("Source is optional.")]
	public AudioSource Source;
	public void PlayStep()
	{
		SoundManager.StepMaterial material = SoundManager.StepMaterial.Dirt;
		if (SceneDirector.current.currentScene != SceneName.TOWN && SceneDirector.current.currentScene != SceneName.CHURCH_SLEEP)
		{
			material = SoundManager.StepMaterial.WoodPlanks;
		}
		else
		{
			//Debug.DrawRay(transform.position+transform.up*0.2f, -transform.up*0.5f, Color.red, 0.2f, true);
			RaycastHit[] hits = Physics.RaycastAll(transform.position + transform.up * 0.2f, -transform.up, 0.5f);
			for (int i = 0; i < hits.Length; i++)
			{
				StepMaterial m = hits[i].transform.gameObject.GetComponent<StepMaterial>();
				if (m)
				{
					material = m.Material;
				}
			}
		}

		AudioSource.PlayClipAtPoint(SoundManager.Current.GetRandomStep(material), transform.position+transform.forward*0.5f, SoundManager.Current.FootStepsVolume);
	}

	public void PlayClip(int index)
	{
		if (index < Clips.Length)
		{
			if (Source != null)
			{
				Source.PlayOneShot(Clips[index]);
			}
			else
			{
				AudioSource.PlayClipAtPoint(Clips[index], transform.position, 0.2f);
			}
		}
	}
}
