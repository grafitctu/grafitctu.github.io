using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.SceneManagement;

public class MainMenuSceneManager : MonoBehaviour
{
	[SerializeField] private Animator animator = null;
	[SerializeField] private AudioMixer masterMixer = null;
	private Vector3 lastGravity;
	public void Awake()
	{
		Cursor.visible = true;
		Cursor.lockState = CursorLockMode.None;
		QualitySettings.SetQualityLevel(PlayerPrefs.HasKey("quality") ? PlayerPrefs.GetInt("quality") : 2);
		lastGravity = Physics.gravity;
		Physics.gravity = new Vector3(0,-9.81f,0)*2;
	}

	public void Start()
	{
		masterMixer.SetFloat("MasterPitch", 1.0f);
		masterMixer.SetFloat("SoundVolume", Mathf.Log10(PlayerPrefs.HasKey("soundVolume") ? PlayerPrefs.GetFloat("soundVolume") : 1.0f) * 20);
		masterMixer.SetFloat("MusicVolume", Mathf.Log10(PlayerPrefs.HasKey("musicVolume") ? PlayerPrefs.GetFloat("musicVolume") : 1.0f) * 20);
	}
	public void PlayGame()
	{
		Physics.gravity = lastGravity;
		SceneManager.LoadScene(1);
	}

	public void QuitGame()
	{
#if UNITY_EDITOR
		UnityEditor.EditorApplication.isPlaying = false;
#else
		Application.Quit();
#endif
	}

	public void Controls()
	{
		animator.SetTrigger("Controls");
	}

	public void Options()
	{
		animator.SetTrigger("Options");
	}

	public void Back()
	{
		animator.SetTrigger("Back");
	}

}
