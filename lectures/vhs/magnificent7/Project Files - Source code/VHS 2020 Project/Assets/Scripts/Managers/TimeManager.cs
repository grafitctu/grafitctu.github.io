using System;
using UnityEngine;
using TMPro;
using UnityEngine.Events;
using UnityEngine.Rendering.PostProcessing;
using Random = UnityEngine.Random;

public class TimeManager : MonoBehaviour
{
    public static TimeManager current;

    public Material[] MorningMaterials = null;

    public Material[] DayMaterials = null;

    public Material[] SunsetMaterials = null;

    public Material[] NightMaterials = null;

    public AnimationCurve ExposureIntensity;

    [SerializeField] private Material currentSkyboxMaterial = null;

    [SerializeField] private SkyboxValues originalSkybox = new SkyboxValues();

    [SerializeField] private SkyboxValues destinationSkybox = new SkyboxValues();

    private Vector3 sunDirection = Vector3.zero;
    private Quaternion sunOriginalRotation = Quaternion.identity;

    [SerializeField] private float skyboxTimer = 0f;

    [SerializeField] private float currentTime = 0f;

    [SerializeField] private int currentDay = 0;

    [SerializeField] private TextMeshProUGUI timeText = null;

    [SerializeField] private TextMeshProUGUI dayText = null;

    [SerializeField] private float hourLengthInSeconds = 0f;

    public UnityEvent onHourPassed = new UnityEvent();
    public UnityEvent onDayPassed = new UnityEvent();

    private AutoExposure autoExposure;

    [Serializable]
    private struct SkyboxValues
    {
        public Color SunDiscColor;
        public float SunDiscMultiplier;
        public float SunDiscExponent;
        public Color SunHaloColor;
        public float SunHaloExponent;
        public Color HorizonLineColor;
        public float HorizonLineExponent;
        public float HorizonLineContribution;
        public Color SkyGradientTop;
        public Color SkyGradientBottom;
        public float SkyGradientExponent;

        public SkyboxValues(Material skybox)
        {
            SunDiscColor = skybox.GetColor("_SunDiscColor");
            SunDiscMultiplier = skybox.GetFloat("_SunDiscMultiplier");
            SunDiscExponent = skybox.GetFloat("_SunDiscExponent");
            SunHaloColor = skybox.GetColor("_SunHaloColor");
            SunHaloExponent = skybox.GetFloat("_SunHaloExponent");
            HorizonLineColor = skybox.GetColor("_HorizonLineColor");
            HorizonLineExponent = skybox.GetFloat("_HorizonLineExponent");
            HorizonLineContribution = skybox.GetFloat("_HorizonLineContribution");
            SkyGradientTop = skybox.GetColor("_SkyGradientTop");
            SkyGradientBottom = skybox.GetColor("_SkyGradientBottom");
            SkyGradientExponent = skybox.GetFloat("_SkyGradientExponent");
        }
    }

    private void Awake()
    {
        if (current == null)
        {
            current = this;
        }
        if (timeText)
        {
            if (currentTime < 10)
                timeText.text = "0" + (int)currentTime + ":00";
            else
                timeText.text = (int)currentTime + ":00";
        }

        if (dayText)
        {
            switch (currentDay)
            {
                case 0:
                    dayText.text = "MON";
                    break;
                case 1:
                    dayText.text = "TUE";
                    break;
                case 2:
                    dayText.text = "WED";
                    break;
                case 3:
                    dayText.text = "THU";
                    break;
                case 4:
                    dayText.text = "FRI";
                    break;
                case 5:
                    dayText.text = "SAT";
                    break;
                case 6:
                    dayText.text = "SUN";
                    break;
                default:
                    break;
            }
        }
        RenderSettings.skybox = Instantiate(RenderSettings.skybox);
        currentSkyboxMaterial = RenderSettings.skybox;
        sunDirection = -RenderSettings.sun.transform.forward;
        sunOriginalRotation = RenderSettings.sun.transform.rotation;
        autoExposure = FindObjectOfType<PostProcessVolume>()?.profile?.GetSetting<AutoExposure>();
    }

    public int GetCurrentTime()
    {
        return (int)currentTime;
    }

    public int GetCurrentDay()
    {
        return currentDay;
    }

    private void Start()
    {
        if (timeText)
        {
            if ((int)currentTime < 10)
                timeText.text = "0" + (int)currentTime + ":00";
            else
                timeText.text = (int)currentTime + ":00";
        }

        if (dayText)
        {
            switch (currentDay)
            {
                case 0:
                    dayText.text = "MON";
                    break;
                case 1:
                    dayText.text = "TUE";
                    break;
                case 2:
                    dayText.text = "WED";
                    break;
                case 3:
                    dayText.text = "THU";
                    break;
                case 4:
                    dayText.text = "FRI";
                    break;
                case 5:
                    dayText.text = "SAT";
                    break;
                case 6:
                    dayText.text = "SUN";
                    break;
                default:
                    break;
            }
        }

        destinationSkybox = new SkyboxValues(MorningMaterials[Random.Range(0, MorningMaterials.Length)]);
        originalSkybox = destinationSkybox;
    }

    void Update()
    {
        int lastHour = (int)currentTime;
        currentTime += Time.deltaTime / hourLengthInSeconds;

        if (lastHour != (int)currentTime)
        {
            AddHour();
        }

        var sun = RenderSettings.sun.transform;
        sun.rotation = sunOriginalRotation * Quaternion.Euler(sunDirection * (180.0f + 15.0f + (1 - currentTime / 24.0f) * 360.0f));
        if (skyboxTimer < 1)
        {
            if (currentTime > 19 && currentTime < 21)
            {
                RenderSettings.sun.intensity = Mathf.Lerp(1, 0, skyboxTimer);
            }
            if (currentTime > 2 && currentTime < 4)
            {
                RenderSettings.sun.intensity = Mathf.Lerp(0, 1, skyboxTimer);
            }
            SetSkyboxToTime(skyboxTimer);
            skyboxTimer += Time.deltaTime / hourLengthInSeconds / 2;
        }

        if (autoExposure)
            autoExposure.keyValue.value = ExposureIntensity.Evaluate(currentTime / 24.0f);
    }

    private void AddHour()
    {
        if ((int)currentTime >= 24f)
        {
            AddDay();
            currentTime = 0f;
        }

        if (timeText)
        {
            if ((int)currentTime < 10)
                timeText.text = "0" + (int)currentTime + ":00";
            else
                timeText.text = (int)currentTime + ":00";
        }

        if (Mathf.FloorToInt(currentTime) == 5)
        {
            StartSkyboxChange(MorningMaterials[Random.Range(0, MorningMaterials.Length)]);
        }
        else if (Mathf.FloorToInt(currentTime) == 7)
        {
            StartSkyboxChange(DayMaterials[Random.Range(0, DayMaterials.Length)]);
        }
        else if (Mathf.FloorToInt(currentTime) == 16)
        {
            StartSkyboxChange(SunsetMaterials[Random.Range(0, SunsetMaterials.Length)]);
        }
        else if (Mathf.FloorToInt(currentTime) == 19)
        {
            StartSkyboxChange(NightMaterials[Random.Range(0, NightMaterials.Length)]);
        }

        onHourPassed.Invoke();
    }

    private void StartSkyboxChange(Material material)
    {
        originalSkybox = destinationSkybox;
        destinationSkybox = new SkyboxValues(material);
        skyboxTimer = 0;
    }

    private void AddDay()
    {
        currentDay++;
        if (currentDay > 6)
            currentDay = 0;

        if (dayText)
        {
            switch (currentDay)
            {
                case 0:
                    dayText.text = "MON";
                    break;
                case 1:
                    dayText.text = "TUE";
                    break;
                case 2:
                    dayText.text = "WED";
                    break;
                case 3:
                    dayText.text = "THU";
                    break;
                case 4:
                    dayText.text = "FRI";
                    break;
                case 5:
                    dayText.text = "SAT";
                    break;
                case 6:
                    dayText.text = "SUN";
                    break;
                default:
                    break;
            }
        }

        onDayPassed.Invoke();
    }

    /// <summary>
    /// Linearly lerps the current skybox values towards destinationSkybox.
    /// </summary>
    /// <param name="time">0-1 range</param>
    private void SetSkyboxToTime(float time)
    {
	    Color groundColor;
	    ColorUtility.TryParseHtmlString("#65491E", out groundColor);
	    RenderSettings.ambientSkyColor = Color.Lerp(originalSkybox.SkyGradientBottom, destinationSkybox.SkyGradientBottom, time);
	    RenderSettings.ambientEquatorColor = Color.Lerp(originalSkybox.SkyGradientBottom, destinationSkybox.SkyGradientBottom, time);
	    float H, S, V;
	    Color.RGBToHSV(RenderSettings.ambientEquatorColor, out H, out S, out V);
	    RenderSettings.ambientEquatorColor = Color.HSVToRGB(H, 0, V);
	    RenderSettings.ambientGroundColor = groundColor * Color.Lerp(originalSkybox.SkyGradientTop, destinationSkybox.SkyGradientTop, time);
	    currentSkyboxMaterial.SetColor("_SunDiscColor", Color.Lerp(originalSkybox.SunDiscColor, destinationSkybox.SunDiscColor,time));
	    currentSkyboxMaterial.SetFloat("_SunDiscMultiplier", Mathf.Lerp(originalSkybox.SunDiscMultiplier, destinationSkybox.SunDiscMultiplier, time));
	    currentSkyboxMaterial.SetFloat("_SunDiscExponent", Mathf.Lerp(originalSkybox.SunDiscExponent, destinationSkybox.SunDiscExponent, time));
	    currentSkyboxMaterial.SetColor("_SunHaloColor", Color.Lerp(originalSkybox.SunHaloColor, destinationSkybox.SunHaloColor, time));
        currentSkyboxMaterial.SetFloat("_SunHaloExponent", Mathf.Lerp(originalSkybox.SunHaloExponent, destinationSkybox.SunHaloExponent, time));
	    currentSkyboxMaterial.SetColor("_HorizonLineColor", Color.Lerp(originalSkybox.HorizonLineColor, destinationSkybox.HorizonLineColor, time));
	    currentSkyboxMaterial.SetFloat("_HorizonLineExponent", Mathf.Lerp(originalSkybox.HorizonLineExponent, destinationSkybox.HorizonLineExponent, time));
	    currentSkyboxMaterial.SetFloat("_HorizonLineContribution", Mathf.Lerp(originalSkybox.HorizonLineContribution, destinationSkybox.HorizonLineContribution, time));
	    currentSkyboxMaterial.SetColor("_SkyGradientTop", Color.Lerp(originalSkybox.SkyGradientTop, destinationSkybox.SkyGradientTop, time));
	    currentSkyboxMaterial.SetColor("_SkyGradientBottom", Color.Lerp(originalSkybox.SkyGradientBottom, destinationSkybox.SkyGradientBottom, time));
	    currentSkyboxMaterial.SetFloat("_SkyGradientExponent", Mathf.Lerp(originalSkybox.SkyGradientExponent, destinationSkybox.SkyGradientExponent, time));
    }
}
