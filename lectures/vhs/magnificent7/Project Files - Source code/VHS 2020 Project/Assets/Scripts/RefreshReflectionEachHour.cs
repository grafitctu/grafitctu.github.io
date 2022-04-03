using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class RefreshReflectionEachHour : MonoBehaviour
{
	ReflectionProbe probe;
	// Start is called before the first frame update
    void Start()
    {
        TimeManager.current.onHourPassed.AddListener(OnHourPassed);
        probe = GetComponent<ReflectionProbe>();
    }

    private void OnHourPassed()
    {
	    if (probe != null)
	    {
		    probe.RenderProbe();
	    }
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
