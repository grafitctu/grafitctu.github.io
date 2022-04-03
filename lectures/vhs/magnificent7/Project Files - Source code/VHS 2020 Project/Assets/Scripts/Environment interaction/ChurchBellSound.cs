using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class ChurchBellSound : MonoBehaviour
{
	public Animator bellAnimator;
	// Start is called before the first frame update
    void Start()
    {
	    TimeManager.current.onHourPassed.AddListener(HourPassed);
    }

    private void HourPassed()
    {
	    var currentTime = TimeManager.current.GetCurrentTime();
	    if (new []{6,18}.Contains(Mathf.FloorToInt(currentTime)))
	    {
		    StartCoroutine(RingBell(6));
	    }else if (Mathf.FloorToInt(currentTime) == 12)
	    {
		    StartCoroutine(RingBell(12));
	    }
	}

    private IEnumerator RingBell(int count)
    {
	    for (int i = 0; i < count; i++)
	    {
			bellAnimator.SetTrigger("Ring");
		    yield return new WaitForSeconds(1.1f);
		}
    }
}
