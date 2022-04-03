using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
public class DialogResponseManager : MonoBehaviour
{
    public static DialogResponseManager current;
    [SerializeField] private TextMeshProUGUI responseText = null;
    [SerializeField] private GameObject responsePanel = null;
    [SerializeField] private GameObject optionsPanel = null;
    private float cooldown = 0f;
    [SerializeField] private float freezeTime = 0f;

    private void Awake()
    {
        if (current == null)
        {
            current = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void Response(string response)
    {
        Debug.Log("RESPONSE!");
        //Hide options (disable manager)
        DialogOptionManager.current.enabled = false;
        optionsPanel.SetActive(false);
        //Set response text
        responseText.text = response;
        //Show response
        responsePanel.SetActive(true);

        //Play response sound
        SoundManager.Current.PlayTalking(DialogOptionManager.current.currentNPC.transform.position, DialogOptionManager.current.currentNPC.GetComponent<NPC>().GetGender());

        cooldown = Time.time;
    }

    public void HideResponse()
    {
        Debug.Log("HIDE RESPONSE!");
        //Hide response
        responsePanel.SetActive(false);
        //Show options (enable manager)
        DialogOptionManager.current.enabled = true;
        optionsPanel.SetActive(true);
    }

    private void Update()
    {
        if (responsePanel.activeInHierarchy && Time.time > cooldown + freezeTime)
        {
            if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.E))
            {
                StartCoroutine(HideResponseAfterFrame());
            }
        }
    }

    private IEnumerator HideResponseAfterFrame()
    {
        yield return new WaitForEndOfFrame();
        HideResponse();
    }

}
