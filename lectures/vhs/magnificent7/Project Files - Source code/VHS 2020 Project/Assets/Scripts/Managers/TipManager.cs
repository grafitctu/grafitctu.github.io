using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class TipManager : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI titleText;
    [SerializeField] private TextMeshProUGUI descriptionText;

    [SerializeField] private GameObject tipObject;

    [SerializeField] private AudioClip tipSound;

    public static TipManager current;

    private bool tipShown = false;

    private void Awake()
    {
        if(current == null)
        {
            current = this;
        }
        else
        {
            Destroy(this);
        }
    }

    public void ShowTip(string title, string description)
    {
        tipShown = true;
        titleText.text = title;
        descriptionText.text = description;
        GameManager.current.playerObject.GetComponent<Player_Base>().canInteract = false;
        GetComponent<AudioSource>().PlayOneShot(tipSound);

        tipObject.SetActive(true);

        Time.timeScale = 0f;
    }

    public void HideTip()
    {
        tipShown = false;
        Time.timeScale = 1f;
        GameManager.current.playerObject.GetComponent<Player_Base>().canInteract = true;

        tipObject.SetActive(false);

    }

    public bool TipShown()
    {
        return tipShown;
    }



}
