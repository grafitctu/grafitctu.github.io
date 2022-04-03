using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using System;

public class DialogOptionManager : MonoBehaviour
{
    public static DialogOptionManager current;

    [SerializeField] GameObject optionsPanel;

    [SerializeField] TextMeshProUGUI[] options;

    [SerializeField] TextMeshProUGUI currentOption;

    [SerializeField] GameObject HUDPanel;

    private NPC currentNPC;

    public event Action onOptionUsed;

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
        if (current.optionsPanel.activeInHierarchy)
        {
            if (Input.GetKeyDown(KeyCode.DownArrow))
            {
                NextOption();
            }

            if (Input.GetKeyDown(KeyCode.UpArrow))
            {
                PreviousOption();
            }

            if (Input.GetKeyDown(KeyCode.Return))
            {
                UseOption();
            }
        }
    }

    private void UseOption()
    {
        //Play option select sound
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
        onOptionUsed?.Invoke();
    } 

    private void NextOption()
    {
        //Play option sound
        currentOptionIndex++;
        if(currentOptionIndex >= options.Length)
        {
            currentOptionIndex = 0;
        }
        SetCurrentOption();
    }

    private void PreviousOption()
    {
        //Play option sound
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
                currentOption.color = Color.grey;
            currentOption = options[currentOptionIndex];
            currentOption.color = Color.white;
        }
    }

    public void AddOptions(TextMeshProUGUI[] newOptions)
    {
        Array.Clear(options, 0, options.Length);
        options = new TextMeshProUGUI[newOptions.Length];
        options = newOptions;
        foreach (var option in options)
        {
            option.color = Color.grey;
        }
        currentOptionIndex = 0;
        SetCurrentOption();
    }
}
