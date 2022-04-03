using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class PlayerSelectionRaycast : MonoBehaviour
{
    public GameObject selection = null;

    [SerializeField] private int rayLength;

    [SerializeField] private LayerMask layerMaskInteractible;

    private void Update()
    {
        RaycastHit hit;
        Vector3 fwd = transform.TransformDirection(Vector3.forward);

        Debug.DrawLine(transform.position, transform.position + (fwd*rayLength));

        if (Physics.Raycast(transform.position, fwd, out hit, rayLength, layerMaskInteractible.value))
        {
            
            selection = hit.transform.gameObject;
            if(selection != null)
            {
                HelpTextManager.current.ShowHelpText(selection.GetComponent<IInteractible>().GetName());
                if (Input.GetKeyDown(KeyCode.E))
                {
                    selection.GetComponent<IInteractible>()?.Interact();
                }
            }
            
        }
        else
        {
            HelpTextManager.current.HideHelpText();
            selection = null;
        }
    }
}
