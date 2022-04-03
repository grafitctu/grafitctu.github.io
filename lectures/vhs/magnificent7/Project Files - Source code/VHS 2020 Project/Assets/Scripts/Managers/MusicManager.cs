using UnityEngine;
using Random = UnityEngine.Random;

public class MusicManager : MonoBehaviour
{
	public enum SoundClipState
	{
		Off,
		Ready,
		Attack,
		Playing,
		Release,
		Cooldown
	}

	public enum Priority
	{
		Ambient,
		Cutscene,
		OnDemand
	}

    public static MusicManager current;
    private AudioSource musicSource = null;

    public AudioClip[] dayMusic = null;
    public AudioClip[] nightMusic = null;
    public AudioClip sundayChurchMusic = null;
    public AudioClip saloonMusic = null;

    public float volumeModifier = 0f;
	
    [SerializeField]
    private float timer = 0f;
    [SerializeField]
    private SoundClipState state = SoundClipState.Off;
    [SerializeField]
    private AudioClip next = null;
    private Priority currentPriority = Priority.Ambient;
    private Priority nextPriority = Priority.Ambient;
    private float lastTime = 0f;
    private SceneName currentScene = SceneName.TOWN;
    private int musicStoppedAt = -10;
	public void Awake()
    {
        if(current == null)
        {
            current = this;
        }

        musicSource = GetComponent<AudioSource>();
    }

    public void Start()
    {
	    SceneDirector.current.onSceneChanged.AddListener(SceneChanged);
	    TimeManager.current.onHourPassed.AddListener(HourChanged);
	    lastTime = TimeManager.current.GetCurrentTime();
	    //ChangeSong(GetClipByTime(TimeManager.current.GetCurrentTime()));
    }


	public void Update()
    {
	    switch (state)
	    {

		    case SoundClipState.Off:
			    if (next != null)
			    {
				    timer = 0;
				    state = SoundClipState.Ready;
			    }
			    break;
			case SoundClipState.Ready:
				state = SoundClipState.Playing;
				musicSource.clip = next;
				musicSource.volume = volumeModifier;
				next = null;
				currentPriority = nextPriority;
				timer = 0;
				musicSource.Play();
				break;
		    case SoundClipState.Attack:
			    if (timer > 2.0f)
			    {
				    state = SoundClipState.Playing;
				    timer = 0;
			    }
			    else
			    {
				    musicSource.volume = Easings.Interpolate(timer / 2.0f, Easings.Functions.CubicEaseIn)* volumeModifier;
			    }
				break;
		    case SoundClipState.Playing:
			    if (!musicSource.isPlaying && musicSource.time>=musicSource.clip.length)
			    {
				    timer = 0;
				    state = SoundClipState.Release;
				}
			    break;
		    case SoundClipState.Release:
			    if (timer > 2.0f)
			    {
				    musicSource.clip = null;
				    state = SoundClipState.Off;
				    timer = 0;
					musicSource.Stop();
			    }
			    else
			    {
				    musicSource.volume = Easings.Interpolate((1 - timer / 2.0f), Easings.Functions.CubicEaseIn) * volumeModifier;
			    }
				break;
	    }
	    timer += Time.deltaTime;
    }

	public void ChangeSong(AudioClip clip)
    {
	    if (clip != musicSource.clip)
	    {
		    next = clip;
		    timer = 0;
		    state = SoundClipState.Release;
		}
    }

    public void PlaySong(AudioClip clip)
    {
	    next = clip;
	    timer = 0;
	    state = SoundClipState.Ready;
    }

    public void StopMusic()
    {
	    next = null;
	    timer = 0;
	    state = SoundClipState.Release;
    }

    private AudioClip GetClipByTime(float time)
    {
	    if (time > 19 || time < 7)
	    {
			//Night music
			return nightMusic[Random.Range(0, nightMusic.Length)];
	    }
	    else
	    {
		    //Day music
		    return dayMusic[Random.Range(0, dayMusic.Length)];
	    }
	}

	private void HourChanged()
    {
	    if (next == null && currentScene == SceneName.TOWN &&  (TimeManager.current.GetCurrentTime() - musicStoppedAt) % 24 > 3)
	    {
		    next = GetClipByTime(TimeManager.current.GetCurrentTime());
	    }
	}
    private void SceneChanged(SceneName newSceneName)
    {
	    currentScene = newSceneName;
	    switch (newSceneName)
	    {
		    case SceneName.TOWN:
			    ChangeSong(GetClipByTime(TimeManager.current.GetCurrentTime()));
			    break;
		    case SceneName.SHERIFF:
			    break;
		    case SceneName.SALOON:
				StopMusic();
			    break;
		    case SceneName.MERCHANT:
			    musicSource.loop = false;
			    break;
		    case SceneName.CHURCH:
			    if (TimeManager.current.GetCurrentDay() == 6)
			    {
					ChangeSong(sundayChurchMusic);
			    }
			    else
			    {
					StopMusic();
			    }
				break;
	    }
    }
}
