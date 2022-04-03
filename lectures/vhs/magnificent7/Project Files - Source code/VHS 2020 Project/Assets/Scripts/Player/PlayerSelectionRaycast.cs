using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class PlayerSelectionRaycast : MonoBehaviour
{
    public GameObject selection = null;

    public GameObject debugSelection = null;

    [SerializeField] private int rayLength = 0;

    [SerializeField] private LayerMask layerMaskInteractible = new LayerMask();

    private void FixedUpdate()
    {
        RaycastHit hit;
        Vector3 fwd = transform.TransformDirection(Vector3.forward);

        Debug.DrawLine(transform.position, transform.position + (fwd*rayLength));

        if (Physics.Raycast(transform.position, fwd, out hit, rayLength, layerMaskInteractible.value))
        {
            
            selection = hit.transform.gameObject;
   
        }
        else
        {
            HelpTextManager.current.HideHelpText();
            selection = null;
        }
    }

    private void Update()
    {
        if (selection != null && GameManager.current.playerObject.GetComponent<Player_Base>().canInteract)
        {
            HelpTextManager.current.ShowHelpText(selection.GetComponent<IInteractible>().GetName());
            if (Input.GetKeyDown(KeyCode.E) && GameManager.current.playerObject.GetComponent<Player_Base>().canInteract && !TipManager.current.TipShown())
            {
                //selection.GetComponent<IInteractible>()?.Interact();
                StartCoroutine("InteractWithSelection");
            }
        }
    }

    private IEnumerator InteractWithSelection()
    {
        yield return new WaitForEndOfFrame();
        selection.GetComponent<IInteractible>()?.Interact();
    }
}
