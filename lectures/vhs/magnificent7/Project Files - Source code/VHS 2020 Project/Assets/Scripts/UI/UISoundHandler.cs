using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

public class UISoundHandler : MonoBehaviour, IPointerEnterHandler, IPointerClickHandler
{
	public AudioClip hover;
	public AudioClip click;
	public AudioSource src;

	public void OnPointerEnter(PointerEventData eventData)
    {
	    if (src && hover)
	    {
		    src.PlayOneShot(hover);
	    }
	}

	public void OnPointerClick(PointerEventData eventData)
	{
		if (src && click)
			src.PlayOneShot(click);
	}
}
