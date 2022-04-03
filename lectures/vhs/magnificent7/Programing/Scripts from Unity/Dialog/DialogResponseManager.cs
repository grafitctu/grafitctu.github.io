using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class DialogResponseManager : MonoBehaviour
{
    public static DialogResponseManager current;
    [SerializeField] private TextMeshProUGUI responseText;
    [SerializeField] private GameObject responsePanel;
    [SerializeField] private GameObject optionsPanel;

    private float cooldown;
    [SerializeField] private float freezeTime;

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

    public void Response(string response)
    {
        Debug.Log("RESPONSE!");
        //Hide options (disable manager)
        DialogOptionManager.current.enabled = false;
        optionsPanel.SetActive(false);
        //Set response text
        responseText.text = response;
        //Show response
        responsePanel.SetActive(true);

        //Play response sound

        cooldown = Time.time;
    }

    public void HideResponse()
    {
        Debug.Log("HIDE RESPONSE!");
        //Hide response
        responsePanel.SetActive(false);
        //Show options (enable manager)
        DialogOptionManager.current.enabled = true;
        optionsPanel.SetActive(true);
    }

    private void Update()
    {
        if (responsePanel.activeInHierarchy && Time.time > cooldown + freezeTime)
        {
            if (Input.GetKeyDown(KeyCode.Return))
            {
                HideResponse();
            }
        }
    }

}
