using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class Dialog : MonoBehaviour
{
    [SerializeField] private DialogOption[] dialogOptions = null;
    [SerializeField] private GameObject UIContainer;
    [SerializeField] private GameObject dialogOptionPrefab;

    private List<TextMeshProUGUI> newOptions = new List<TextMeshProUGUI>();

    private void Start()
    {
        UIContainer = UIManager.current.UIContainer;
        dialogOptionPrefab = UIManager.current.dialogOptionPrefab;
    }

    public void ShowDialogOptions()
    {
        foreach (Transform child in UIContainer.transform)
        {
            Destroy(child.gameObject);
        }

        newOptions.Clear();

        if(dialogOptions.Length == 0)
        {
            return;
        }

        foreach (var dialogOption in dialogOptions)
        {
            if (dialogOption.RequirementState())
            {
                ShowDialogOption(dialogOption);
            }
        }

        DialogOptionManager.current.AddOptions(newOptions.ToArray());
    }

    private void ShowDialogOption(DialogOption dialogOption)
    {
        if ((dialogOption.oneTime && !dialogOption.alreadyUsed) || !dialogOption.oneTime)
        {
            GameObject newOption = Instantiate(dialogOptionPrefab, UIContainer.transform);
            newOption.GetComponent<DialogOptionScript>().optionReference = dialogOption;
            newOption.GetComponent<TextMeshProUGUI>().text = dialogOption.text;
            newOption.GetComponent<DialogOptionScript>().objective = dialogOption.objective;
            newOption.GetComponent<DialogOptionScript>().optionType = dialogOption.optionType;
            newOption.GetComponent<DialogOptionScript>().lootType = dialogOption.lootType;
            newOption.GetComponent<DialogOptionScript>().response = dialogOption.response;
            newOption.GetComponent<DialogOptionScript>().gold = dialogOption.gold;
            newOption.GetComponent<DialogOptionScript>().oneTime = dialogOption.oneTime;
            newOption.GetComponent<DialogOptionScript>().lootItem = dialogOption.lootItem;
            newOption.GetComponent<DialogOptionScript>().lootAmmo = dialogOption.lootAmmo;
            newOption.GetComponent<DialogOptionScript>().unlockable = dialogOption.unlockable;
            newOptions.Add(newOption.GetComponent<TextMeshProUGUI>());
        }
    }
}
