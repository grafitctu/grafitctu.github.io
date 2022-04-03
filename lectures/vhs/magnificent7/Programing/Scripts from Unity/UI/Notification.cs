using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class Notification : MonoBehaviour
{
    public string content;
    [SerializeField] RollingText rollingText;

    public void Setup()
    {
        GetComponent<TextMeshProUGUI>().text = content;
    }

    public void Float()
    {
        GetComponent<Animator>().SetTrigger("Float");
    }

    public void onFloatingStopped()
    {
        rollingText.isFloating = false;
    }
}
