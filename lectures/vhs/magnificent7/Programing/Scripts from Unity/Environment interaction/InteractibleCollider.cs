using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class InteractibleCollider : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI helpText = null;
    bool interactible = false;

    private void OnTriggerEnter(Collider other)
    {
        if(other.tag == "Player")
        {
            helpText.enabled = true;
            interactible = true;
        }
    }

    private void OnTriggerExit(Collider other)
    {
        if(other.tag == "Player")
        {
            helpText.enabled = false;
            interactible = false;
        }
    }

    private void OnDestroy()
    {
        if(helpText)
            helpText.enabled = false;
        interactible = false;
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.E) && interactible)
        {
            transform.parent.GetComponent<IInteractible>().Interact();
        }
    }
}
