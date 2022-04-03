using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using System;

public class DialogOptionManager : MonoBehaviour
{
    public static DialogOptionManager current;

    [SerializeField] GameObject optionsPanel = null;

    [SerializeField] TextMeshProUGUI[] options = null;

    [SerializeField] TextMeshProUGUI currentOption = null;

    [SerializeField] GameObject HUDPanel = null;

    public NPC currentNPC = null;

    int currentOptionIndex = 0;

    private void Awake()
    {
        if (current == null)
        {
            current = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void Update()
    {
        if (current.optionsPanel.activeInHierarchy && !TipManager.current.TipShown())
        {
            if (Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.S))
            {
                NextOption();
            }

            if (Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.W))
            {
                PreviousOption();
            }

            if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.E))
            {
                UseOption();
            }
        }
    }

    private void UseOption()
    {
	    SoundManager.Current.PlayUI(SoundManager.Current.confirmSelectionClip);
        if(currentOption)
            currentOption.GetComponent<DialogOptionScript>().Action();
    }

    public void ShowDialogWindow(bool show, NPC npc)
    {
        Debug.Log("Showin options , " + show);
        if (show)
        {
            HelpTextManager.current.HideHelpText();
            optionsPanel.SetActive(true);
            HUDPanel.SetActive(false);
            DisablePlayer(npc);
        }
        else
        {
            optionsPanel.SetActive(false);
            HUDPanel.SetActive(true);
            EnablePlayer();
            currentNPC.ChangeState(NPCState.IDLE);
        }
    }

    private void DisablePlayer(NPC npc)
    {
        GameManager.current.playerObject.GetComponent<MoveVelocity>().StopMoving();
        GameManager.current.playerObject.GetComponent<Player_Base>().playerCamera.enabled = false;
        currentNPC = npc;
        currentNPC.GetNPCCamera().enabled = true;
        GameManager.current.playerObject.GetComponent<Player_Base>().playerCamera.GetComponent<PlayerSelectionRaycast>().enabled = false;

    }

    private void EnablePlayer()
    {
        GameManager.current.playerObject.GetComponent<MoveVelocity>().StartMoving();
        currentNPC.GetNPCCamera().enabled = false;
        GameManager.current.playerObject.GetComponent<Player_Base>().playerCamera.enabled = true;
        GameManager.current.playerObject.GetComponent<Player_Base>().playerCamera.GetComponent<PlayerSelectionRaycast>().enabled = true;

    }

    public void QuestChanged()
    {
        currentNPC.GetComponent<Dialog>().ShowDialogOptions();
    } 

    private void NextOption()
    {
	    SoundManager.Current.PlayUI(SoundManager.Current.changeSelectionClip);
        currentOptionIndex++;
        if(currentOptionIndex >= options.Length)
        {
            currentOptionIndex = 0;
        }
        SetCurrentOption();
    }

    private void PreviousOption()
    {
	    SoundManager.Current.PlayUI(SoundManager.Current.changeSelectionClip);
        currentOptionIndex--;
        if (currentOptionIndex < 0)
        {
            currentOptionIndex = options.Length-1;
        }

        SetCurrentOption();
    }

    private void SetCurrentOption()
    {
        if(options.Length != 0)
        {
            if(currentOption != null)
                currentOption.color = new Color32(205, 156, 34, 255);
            currentOption = options[currentOptionIndex];
            currentOption.color = new Color32(253, 222, 13, 255);
        }
    }

    public void AddOptions(TextMeshProUGUI[] newOptions)
    {
        Array.Clear(options, 0, options.Length);
        options = new TextMeshProUGUI[newOptions.Length];
        options = newOptions;
        foreach (var option in options)
        {
            option.color = new Color32(205, 156, 34, 255);
        }
        currentOptionIndex = 0;
        SetCurrentOption();
    }
}
