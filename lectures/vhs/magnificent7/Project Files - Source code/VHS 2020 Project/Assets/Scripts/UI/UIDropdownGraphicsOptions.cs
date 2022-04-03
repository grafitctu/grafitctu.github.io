using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using UnityEngine;

public class UIDropdownGraphicsOptions : MonoBehaviour
{
	private TMP_Dropdown dropdown;
    // Start is called before the first frame update
    void Start()
    {
	    dropdown = GetComponent<TMP_Dropdown>();
        dropdown.ClearOptions();
        dropdown.options = QualitySettings.names.Select(x => new TMP_Dropdown.OptionData() {text=x, image=null }).ToList();
        dropdown.value = QualitySettings.GetQualityLevel();
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void OnChange()
    {
	    PlayerPrefs.SetInt("quality", dropdown.value);
	    QualitySettings.SetQualityLevel(dropdown.value);
	    var t = FindObjectOfType<UIVsyncToggle>();
	    if (t)
	    {
		    t.Sync();
	    }
    }
}
