using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GamblingSpot : MonoBehaviour, IInteractible
{
    [SerializeField] private string spotName = "";
    [SerializeField] private Camera gamblingCamera = null;

    public string GetName()
    {
        return spotName;
    }

    public void Interact()
    {
        if(GameManager.current.playerObject.GetComponent<Player_Base>().GetGold() > 10)
        {
            Gamble();
        }
        else
        {
            HelpTextManager.current.ShowErrorMessage("I don't have anough gold.");
        }
    }

    public void SetInteractible(bool val)
    {

    }
    
    private void Gamble()
    {
        StartCoroutine(GameManager.current.playerObject.GetComponent<Player_Base>().Gamble(gamblingCamera));
    }
}
