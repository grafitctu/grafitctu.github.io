using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.UI;

[RequireComponent(typeof(Slider))]
public class UIMixerSlider : MonoBehaviour
{
	private Slider slider;
	public AudioMixer MasterMixer;
	public string MixerString;
	public string PrefsString;

    // Start is called before the first frame update
    void Awake()
    {
	    slider = GetComponent<Slider>();
        slider.value = PlayerPrefs.HasKey(PrefsString) ? PlayerPrefs.GetFloat(PrefsString) : 1.0f;
        slider.onValueChanged.AddListener(OnChange);
    }

    private void OnChange(float arg0)
    {
	    PlayerPrefs.SetFloat(PrefsString, arg0);
	    MasterMixer.SetFloat(MixerString, Mathf.Log10(arg0) * 20);
    }
}
