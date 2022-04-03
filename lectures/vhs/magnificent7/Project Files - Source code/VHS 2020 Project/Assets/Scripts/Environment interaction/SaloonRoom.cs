using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;

public class SaloonRoom : MonoBehaviour, IInteractible
{
    [SerializeField] private string nameForInteraction = "";
    [SerializeField] private Camera sleepCamera = null;

    [SerializeField] private bool canInteract = false;

    private bool isSleeping = false;

    public void SetInteractible(bool val)
    {
        canInteract = val;
    }

    public void Interact()
    {
        if(canInteract)
            Sleep();
        else
        {
            HelpTextManager.current.ShowErrorMessage("It's locked");
        }
    }

    private void Start()
    {
        TimeManager.current.onHourPassed.AddListener(CheckForwakeUp);
    }

    private void CheckForwakeUp()
    {
        if(TimeManager.current.GetCurrentTime() == 7 && isSleeping)
        {
            WakeUp();
        }
    }

    public string GetName()
    {
        return nameForInteraction;
    }

    private void Sleep()
    {
        sleepCamera.gameObject.SetActive(true);
        GameManager.current.playerObject.GetComponent<Player_Base>().canMove = false;
        GameManager.current.playerObject.GetComponent<Player_Base>().canInteract = false;
        HelpTextManager.current.HideHelpText();
        isSleeping = true;
        Time.timeScale = 50f;
        SoundManager.Current.MasterMixer.SetFloat("MasterPitch", 1.5f);
    }

    private void WakeUp()
    {
        //GameManager.current.playerObject.GetComponent<Player_Base>().playerCamera.gameObject.SetActive(true);
        sleepCamera.gameObject.SetActive(false);
        isSleeping = false;
        GameManager.current.playerObject.GetComponent<Player_Base>().canMove = true;
        GameManager.current.playerObject.GetComponent<Player_Base>().canInteract = true;
        Time.timeScale = 1.0f;
        SoundManager.Current.MasterMixer.SetFloat("MasterPitch", 1.0f);
        GetComponent<Unlockable>()?.Lock();
    }

}
