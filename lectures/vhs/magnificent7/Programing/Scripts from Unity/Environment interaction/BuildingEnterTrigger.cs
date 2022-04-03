using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.SceneManagement;

[System.Serializable]
public class BuildingEnterTrigger : MonoBehaviour, IInteractible
{
    [SerializeField] private Camera entryCamera = null;
    [SerializeField] private Transform playerEntryTransform = null;
    [SerializeField] private string sceneToLoad = "";
    [SerializeField] private float timeToLoadInSeconds = 0f;
    [SerializeField] private string name = "";

    [SerializeField] private PlayableDirector entryDirector;

    public void Interact()
    {
        GameManager.current.playerObject.GetComponent<MoveVelocity>().StopMoving();
        GameManager.current.playerObject.GetComponent<CameraLookWithMouse>().LockCamera();
        GameManager.current.playerObject.transform.position = playerEntryTransform.position;
        GameManager.current.playerObject.transform.rotation = playerEntryTransform.rotation;
        entryDirector.Play();
        Camera.main.enabled = false;
        entryCamera.enabled = true;
        StartCoroutine("LoadSceneAfterTime");
    }

    public string GetName()
    {
        return name;
    }

    private IEnumerator LoadSceneAfterTime()
    {
        PlayerPrefs.SetString("previousScene", SceneManager.GetActiveScene().name);
        yield return new WaitForSeconds(timeToLoadInSeconds);
        SceneManager.LoadScene(sceneToLoad);
    }

}
