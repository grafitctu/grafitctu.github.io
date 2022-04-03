using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;

public class UIMenuButton : MonoBehaviour, IPointerClickHandler, IPointerEnterHandler, IPointerExitHandler
{
	public float strength = 5.0f;
	public bool explosion = false;
	public Joint[] jointsToRemoveOnClick;

	public UnityEvent OnClick;
	public UnityEvent OnClickDelayed;

	private Material[] cachedMaterials;

	public Material HoverMaterial;

	public Material ClickMaterial;
    // Start is called before the first frame update
    void Start()
    {
	    cachedMaterials = GetComponent<MeshRenderer>().sharedMaterials;
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void OnPointerClick(PointerEventData eventData)
    {
	    for (int i = 0; i < jointsToRemoveOnClick.Length; i++)
	    {
		    Destroy(jointsToRemoveOnClick[i]);
	    }
		if (explosion)
		{
			foreach (var rigidbody1 in FindObjectsOfType<Rigidbody>())
			{
				rigidbody1.drag = 0;
				rigidbody1.AddExplosionForce(strength, eventData.pointerCurrentRaycast.worldPosition, 100, 0.2f, ForceMode.Impulse);
			}
		}
	    else
	    {
		    GetComponent<Rigidbody>().AddForceAtPosition(-Vector3.back * strength,
			    eventData.pointerCurrentRaycast.worldPosition, ForceMode.Impulse);
	    }
		OnClick.Invoke();
		Invoke("InvokeDelayed",1.0f);
    }

    public void InvokeDelayed()
    {
		OnClickDelayed.Invoke();
    }

    public void OnPointerEnter(PointerEventData eventData)
    {
	    if (HoverMaterial != null)
	    {
		    MeshRenderer mr = GetComponent<MeshRenderer>();
		    Material[] mats = mr.materials;
		    for (var i = 0; i < mats.Length; i++)
		    {
			    mats[i] = HoverMaterial;
		    }

		    mr.sharedMaterials = mats;
		}
	   
    }

    public void OnPointerExit(PointerEventData eventData)
    {
	    if (HoverMaterial != null)
	    {
		    MeshRenderer mr = GetComponent<MeshRenderer>();
		    mr.sharedMaterials = cachedMaterials;
		}
		
	}
}
