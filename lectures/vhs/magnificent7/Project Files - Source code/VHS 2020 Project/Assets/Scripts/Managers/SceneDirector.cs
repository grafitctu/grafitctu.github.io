using UnityEngine;
using UnityEngine.Events;

public enum SceneName{TOWN,SHERIFF,SALOON,MERCHANT,CHURCH,CHURCH_SLEEP}

public class SceneDirector : MonoBehaviour
{
    public static SceneDirector current;
    public SceneName currentScene;
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
	    currentScene = sceneName;
        onSceneChanged.Invoke(sceneName);
        Debug.Log("onSceneChanged: " + sceneName);
    }

}
