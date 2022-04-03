using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

public enum SceneName{TOWN,SHERIFF,SALOON,MERCHANT,CHURCH}

public class SceneDirector : MonoBehaviour
{
    public static SceneDirector current;
    public UnityEvent<SceneName> onSceneChanged;

    private void Awake()
    {
        if(current == null)
        {
            current = this;
        }
    }

    public void ChangeScene(SceneName sceneName)
    {
        onSceneChanged.Invoke(sceneName);
        Debug.Log("onSceneChanged: " + sceneName);
    }

}
