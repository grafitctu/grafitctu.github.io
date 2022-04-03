using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager current;

    public GameObject playerObject;

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

    public void PlayFadeIn()
    {
        UIManager.current.fadePanels.GetComponent<Animator>().SetTrigger("FadeOut");
    }
}
