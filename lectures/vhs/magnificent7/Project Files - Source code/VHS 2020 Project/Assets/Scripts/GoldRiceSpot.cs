using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GoldRiceSpot : MonoBehaviour, IInteractible
{
    [SerializeField] private string spotName = "";
    [SerializeField] private Camera goldRicingCamera = null;
    [SerializeField] private int timesRiced = 0;

    private void Start()
    {
        TimeManager.current.onDayPassed.AddListener(ResetCount);
    }

    public string GetName()
    {
        return spotName;
    }

    public void Interact()
    {
        RiceGold();
        timesRiced++;
    }

    public void SetInteractible(bool val)
    {

    }

    private void ResetCount()
    {
        timesRiced = 0;
    }
    
    private void RiceGold()
    {
        StartCoroutine(GameManager.current.playerObject.GetComponent<Player_Base>().RiceGold(goldRicingCamera,timesRiced));
    }
}
