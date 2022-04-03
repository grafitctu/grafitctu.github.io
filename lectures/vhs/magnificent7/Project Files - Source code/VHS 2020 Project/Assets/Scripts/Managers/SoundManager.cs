using System;
using JetBrains.Annotations;
using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.Timeline;
using Random = UnityEngine.Random;

public class SoundManager : MonoBehaviour
{
	public enum StepMaterial
	{
		Dirt,
		Wood,
		WoodPlanks,
		Gravel,
		Stone,
		Tiles,
		Custom
	}
	[Header("Master Mixer")]
	public AudioMixer MasterMixer;

	[Header("Sound Volumes")]
	[Range(0f, 2f)]
	public float FootStepsVolume;
	[Header("Sound Database - Steps")]
	public AudioClip[] StepDirt;
	public AudioClip[] StepWood;
	public AudioClip[] StepWoodPlank;
	public AudioClip[] StepGravel;
	public AudioClip[] StepStone;
	public AudioClip[] StepTiles;
	[Header("Sound Database - Collisions")]
	public AudioClip[] CollisionWood;

	[Header("Sound Database - Talking")]
	public AudioClip[] MumbleGenericMale;
	public AudioClip[] MumbleGenericFemale;

	[Header("Sound Database - Player")] public AudioClip ChangeWeapon;

	private bool _isInside;
	private bool IsInside
	{
		get
		{
			return _isInside;
		}
		set
		{
			_isInside = value;
			_changeInside = true;
		}
	}
	private float _timer;
	private bool _changeInside;
	private AudioClip _emptyClip;
	public static SoundManager Current;

	//UI sounds
	private AudioSource uiSfxSource;
	[Header("Sound Database - UI")]
	public AudioClip changeSelectionClip;
	public AudioClip confirmSelectionClip;
	[UsedImplicitly]
	void Awake()
	{
		if (!Current)
			Current = this;
		_emptyClip = AudioClip.Create("nothing", 1, 1, 1000, false);
		uiSfxSource = transform.Find("ui")?.GetComponent<AudioSource>();
	}
	// Start is called before the first frame update
	[UsedImplicitly]
	void Start()
	{
		SceneDirector.current.onSceneChanged.AddListener(SceneChanged);
		MasterMixer.SetFloat("SoundVolume", Mathf.Log10(PlayerPrefs.HasKey("soundVolume") ? PlayerPrefs.GetFloat("soundVolume") : 1.0f) * 20);
		MasterMixer.SetFloat("MusicVolume", Mathf.Log10(PlayerPrefs.HasKey("musicVolume") ? PlayerPrefs.GetFloat("musicVolume") : 1.0f) * 20);
	}

	public void SetInsideInstant(bool status)
	{
		_isInside = status;
		if (status)
		{
			MasterMixer.SetFloat("OutsideLF", 666.0f);
		}
		else
		{
			MasterMixer.SetFloat("OutsideLF", 22000.0f);
		}
	}
	public void SetInside(bool status)
	{
		IsInside = status;
	}

	public void SceneChanged(SceneName arg0)
	{
		switch (arg0)
		{
			case SceneName.TOWN:
				IsInside = false;
				break;
			case SceneName.SHERIFF:
				IsInside = true;
				break;
			case SceneName.SALOON:
				IsInside = true;
				break;
			case SceneName.MERCHANT:
				IsInside = true;
				break;
			case SceneName.CHURCH:
				IsInside = true;
				break;
		}
	}

	// Update is called once per frame
	[UsedImplicitly]
	void Update()
	{
		if (MasterMixer != null && _changeInside)
		{
			_timer = Mathf.Clamp01(_timer);
			if (IsInside)
			{

				MasterMixer.SetFloat("OutsideLF", Easings.CubicEaseOut(1 - _timer) * (22000.0f - 666.0f) + 666.0f);
			}
			else
			{

				MasterMixer.SetFloat("OutsideLF", Easings.CubicEaseIn(_timer) * (22000.0f - 666.0f) + 666.0f);
			}
			if (_timer >= 1.0f)
			{
				_changeInside = false;
				_timer = 0;
			}
			else
			{
				_timer += Time.deltaTime;
			}
		}
	}

	public AudioClip GetRandomStep(StepMaterial material)
	{
		switch (material)
		{
			case StepMaterial.Dirt:
				return StepDirt[Random.Range(0, StepDirt.Length)];
			case StepMaterial.Wood:
				return StepWood[Random.Range(0, StepWood.Length)];
			case StepMaterial.WoodPlanks:
				return StepWoodPlank[Random.Range(0, StepWoodPlank.Length)];
			case StepMaterial.Gravel:
				return StepGravel[Random.Range(0, StepGravel.Length)];
			case StepMaterial.Stone:
				return StepStone[Random.Range(0, StepStone.Length)];
			case StepMaterial.Tiles:
				return StepTiles[Random.Range(0, StepTiles.Length)];
			default:
				return null;
		}
	}
	public AudioClip GetRandomCollision(StepMaterial material)
	{
		switch (material)
		{
			case StepMaterial.Dirt:
				return _emptyClip;
			case StepMaterial.Wood:
			case StepMaterial.WoodPlanks:
				return CollisionWood[Random.Range(0, CollisionWood.Length)];
			case StepMaterial.Gravel:
				return _emptyClip;
			case StepMaterial.Stone:
				return _emptyClip;
			case StepMaterial.Tiles:
				return _emptyClip;
			default:
				return _emptyClip;
		}
	}


	public void PlayUI(AudioClip clip)
	{
		if (uiSfxSource)
		{
			uiSfxSource.PlayOneShot(clip);
		}
	}

	public void PlayTalking(Vector3 transformPosition, TalkType type)
	{
		AudioClip clip = null;
		switch (type)
		{
			case TalkType.Male:
				clip = MumbleGenericMale[Random.Range(0, MumbleGenericMale.Length)];
				break;
			case TalkType.Female:
				clip = MumbleGenericFemale[Random.Range(0, MumbleGenericFemale.Length)];
				break;
			case TalkType.Sheriff:
				break;
			case TalkType.Bartender:
				break;
			case TalkType.Priest:
				break;
		}

		if (clip!=null)
		{
			AudioSource.PlayClipAtPoint(clip, transformPosition, 1.0f);
		}
	}

	public enum TalkType
	{
		Male,
		Female,
		Sheriff,
		Bartender,
		Priest
	}
}
