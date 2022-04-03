using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class Lantern : MonoBehaviour
{
	private MeshRenderer mr = null;

	private Light lanternLight = null;
    // Start is called before the first frame update
    void Start()
    {
	    mr = GetComponent<MeshRenderer>();
		lanternLight = GetComponent<Light>();
        TimeManager.current.onHourPassed.AddListener(OnHourPassed);
    }

    private void OnHourPassed()
    {
	    Material glass = mr.materials[3];
	    float t = TimeManager.current.GetCurrentTime();
	    if ((int)t >  17)
	    {
			lanternLight.enabled = true;
		    glass.SetColor("_EmissionColor", new Color(3.89019632f, 2.35294151f, 0.313725471f, 1));
	    }
        else if ((int) t > 6)
	    {
			lanternLight.enabled = false;
		    glass.SetColor("_EmissionColor", Color.black);
	    }

    }
}
