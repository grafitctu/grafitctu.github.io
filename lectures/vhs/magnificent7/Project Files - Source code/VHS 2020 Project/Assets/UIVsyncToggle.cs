using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(Toggle))]
public class UIVsyncToggle : MonoBehaviour
{
	private Toggle t;
    // Start is called before the first frame update
    void Start()
    {
	    t = GetComponent<Toggle>();
	    Sync();
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void Sync()
    {
	    if (!t)
	    {
		    t = GetComponent<Toggle>();
	    }
	    t.isOn = QualitySettings.vSyncCount > 0;
    }

    public void OnChange()
    {
	    QualitySettings.vSyncCount = t.isOn ? 1 : 0;
    }
}
