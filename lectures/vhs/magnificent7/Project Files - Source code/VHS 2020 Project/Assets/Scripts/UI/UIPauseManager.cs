using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.Rendering.PostProcessing;

public class UIPauseManager : MonoBehaviour
{
	public GameObject PauseCanvas;
	public PlayableDirector intro;
	private float lastTimeScale = 1.0f;
	private CursorLockMode cursorMode;
	private DepthOfField blur;

	private List<PlayableDirector> pausedDirectors = new List<PlayableDirector>();
    // Start is called before the first frame update
    void Start()
    {
	    blur = FindObjectOfType<PostProcessVolume>()?.profile?.GetSetting<DepthOfField>();
    }

    // Update is called once per frame
    private void Update()
    {
	    if (Input.GetKeyDown(KeyCode.Escape))
	    {
		    if (PauseCanvas.activeSelf)
		    {
			    Resume();
			    
			}
		    else
		    {
			    PauseCanvas.SetActive(true);
			    AudioListener.pause = true;
			    lastTimeScale = Time.timeScale;
			    Time.timeScale = 0.0f;
			    cursorMode = Cursor.lockState;
			    Cursor.lockState = CursorLockMode.None;
			    if (blur)
			    {
				    blur.enabled.Override(true);
			    }

			    foreach (var playableDirector in FindObjectsOfType<PlayableDirector>())
			    {
				    if (playableDirector.state == PlayState.Playing)
				    {
						playableDirector.Pause();
						pausedDirectors.Add(playableDirector);
				    }
			    }
			}
	    }
    }

    public void Resume()
    {
	    PauseCanvas.SetActive(false);
	    Time.timeScale = lastTimeScale;
	    Cursor.lockState = cursorMode;
	    AudioListener.pause = false;
		
	    if (blur)
	    {
		    blur.enabled.Override(false);
	    }

	    foreach (var playableDirector in pausedDirectors)
	    {
		    playableDirector.Resume();
	    }
	    pausedDirectors.Clear();
	}

    public void Quit()
    {
#if UNITY_EDITOR
	    UnityEditor.EditorApplication.isPlaying = false;
#else
        Application.Quit ();
#endif
	}
}
