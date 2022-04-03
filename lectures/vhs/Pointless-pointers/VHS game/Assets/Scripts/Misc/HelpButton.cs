using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class HelpButton : MonoBehaviour
{
    public Button helpButton;
    public GameObject helpPanel;
    // Start is called before the first frame update
    void Start()
    {
        Button btn = helpButton.GetComponent<Button>();
        btn.onClick.AddListener(TaskOnClick);
    }
    void TaskOnClick()
    {
        if (helpPanel.activeSelf == true)
        {
            helpPanel.SetActive(false);
        }
        else
        {
            helpPanel.SetActive(true) ;
        }
    }
    // Update is called once per frame
    void Update()
    {
        
    }
}
