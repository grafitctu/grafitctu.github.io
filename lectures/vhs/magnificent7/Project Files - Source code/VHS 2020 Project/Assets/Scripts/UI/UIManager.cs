using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class UIManager : MonoBehaviour
{
    public static UIManager current;

    public GameObject UIContainer;
    public GameObject dialogOptionPrefab;
    public GameObject fadePanels;

    private void Awake()
    {
        if(current == null)
        {
            current = this;
        }
        else
        {
            Destroy(this.gameObject);
        }
    }

  
}
