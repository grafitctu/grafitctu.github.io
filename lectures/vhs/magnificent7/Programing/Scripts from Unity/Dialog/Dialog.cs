using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class Dialog : MonoBehaviour
{
    [SerializeField] private DialogOption[] dialogOptions;
    [SerializeField] private GameObject UIContainer;
    [SerializeField] private GameObject dialogOptionPrefab;

    private List<TextMeshProUGUI> newOptions = new List<TextMeshProUGUI>();

    private void Start()
    {
        DialogOptionManager.current.onOptionUsed += ShowDialogOptions;
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
        GameObject newOption = Instantiate(dialogOptionPrefab, UIContainer.transform);
        newOption.GetComponent<TextMeshProUGUI>().text = dialogOption.text;
        newOption.GetComponent<DialogOptionScript>().objective = dialogOption.objective;
        newOption.GetComponent<DialogOptionScript>().optionType = dialogOption.optionType;
        newOption.GetComponent<DialogOptionScript>().response = dialogOption.response;
        newOptions.Add(newOption.GetComponent<TextMeshProUGUI>());
    }
}
