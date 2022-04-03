using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.SceneManagement;

public class Player_Base : MonoBehaviour
{
    public Camera playerCamera = null;

    private SceneDirector sceneManager = null;

    [SerializeField]
    private Animator playerMovementAnimator = null;

    void OnEnable()
    {
        SceneManager.sceneLoaded += OnSceneLoaded;
    }

    void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        Debug.Log("OnSceneLoaded: " + scene.name);
        Debug.Log(mode);
        GameManager.current.PlayFadeIn();
    }

    private void Start()
    {
        GameManager.current.playerObject = this.gameObject;
        playerCamera = GameManager.current.playerObject.GetComponentInChildren<Transform>().GetComponentInChildren<Camera>();
    }

    public void PlayAnimation(Vector3 movement)
    {
        if (playerMovementAnimator)
        {
            if(movement != Vector3.zero)
            {
                //Play walking sound
                playerMovementAnimator.SetBool("isWalking",true);
            }
            else
                playerMovementAnimator.SetBool("isWalking", false);
        }
    }

    private void Update()
    {
        if (Input.GetKey(KeyCode.Q))
        {
            Application.Quit();
        }
    }
}
