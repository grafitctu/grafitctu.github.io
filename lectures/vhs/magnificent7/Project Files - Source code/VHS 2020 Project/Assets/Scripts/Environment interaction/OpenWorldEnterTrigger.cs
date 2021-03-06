using System.Collections;
using UnityEngine;
using UnityEngine.Playables;

[System.Serializable]
public class OpenWorldEnterTrigger : MonoBehaviour, IInteractible
{
    [SerializeField] private Camera entryCamera = null;
    [SerializeField] private Transform playerEntryTransform = null;
    [SerializeField] private Transform sceneToLoad = null;
    [SerializeField] private float timeToLoadInSeconds = 0f;
    [SerializeField] private SceneName destinationSceneName = SceneName.TOWN;
    [SerializeField] private string nameForInteraction = "";

    private bool isLocked = false;

    [SerializeField] private PlayableDirector entryDirector = null;

    public void Interact()
    {
        if (!isLocked)
        {
            GameManager.current.playerObject.GetComponent<MoveVelocity>().StopMoving();
            GameManager.current.playerObject.GetComponent<CameraLookWithMouse>().LockCamera();
            GameManager.current.playerObject.transform.position = playerEntryTransform.position;
            GameManager.current.playerObject.transform.rotation = playerEntryTransform.rotation;
            GameManager.current.playerObject.GetComponent<Player_Base>().BuildingAnimation();
            entryDirector.Play();
            Camera.main.gameObject.SetActive(false);
            entryCamera.gameObject.SetActive(true);
            StartCoroutine("LoadSceneAfterTime");
        }
        else
        {
            HelpTextManager.current.ShowErrorMessage("It's locked.");
        }

    }

    public string GetName()
    {
        return nameForInteraction;
    }

    public void SetInteractible(bool val)
    {
        isLocked = !val;
    }

    private IEnumerator LoadSceneAfterTime()
    {
        yield return new WaitForSeconds(timeToLoadInSeconds);
        GameManager.current.playerObject.GetComponent<Transform>().position = sceneToLoad.position;
        GameManager.current.playerObject.GetComponent<Transform>().rotation = sceneToLoad.rotation;
        entryCamera.gameObject.SetActive(false);
        GameManager.current.playerObject.GetComponent<Player_Base>().playerCamera.gameObject.SetActive(true);
        GameManager.current.playerObject.GetComponent<MoveVelocity>().StartMoving();
        GameManager.current.playerObject.GetComponent<CameraLookWithMouse>().UnlockCamera();
        SceneDirector.current.ChangeScene(destinationSceneName);
    }

}
