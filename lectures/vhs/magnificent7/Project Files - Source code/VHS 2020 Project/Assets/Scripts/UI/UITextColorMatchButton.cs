using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

[ExecuteInEditMode]
public class UITextColorMatchButton : MonoBehaviour
{
	private TextMeshProUGUI text;
	private Button btn;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
	    if (!text)
	    {
		    text = GetComponent<TextMeshProUGUI>();
	    }
	    else
	    {
		    if (!btn)
		    {
			    btn = GetComponentInParent<Button>();
		    }
		    else
		    {
			    if (btn.interactable)
			    {
				    text.color = btn.colors.normalColor;
			    }
			    else
			    {
				    text.color = btn.colors.disabledColor;
			    }
			}
	    }
    }
}
